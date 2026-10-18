param([Parameter(Mandatory)][string]$UnityPath)
$ErrorActionPreference = 'Stop'
$nativeRoot = Split-Path $PSScriptRoot -Parent
$androidTools = Join-Path (Split-Path $UnityPath -Parent) 'Data/PlaybackEngines/AndroidPlayer'
$buildTools = Join-Path $androidTools 'SDK/build-tools/36.0.0'
$java = Join-Path $androidTools 'OpenJDK/bin/java.exe'
$jarsigner = Join-Path $androidTools 'OpenJDK/bin/jarsigner.exe'
$keytool = Join-Path $androidTools 'OpenJDK/bin/keytool.exe'
$apk = Join-Path $nativeRoot 'out/escape-1829-native.apk'
$aab = Join-Path $nativeRoot 'out/escape-1829-native.aab'
$certificatePath = Join-Path $env:RUNNER_TEMP "android-upload-$env:GITHUB_RUN_ID.cer"
try {
    & $keytool -exportcert -keystore $env:ANDROID_KEYSTORE_PATH -storepass:env ANDROID_KEYSTORE_PASSWORD -alias $env:ANDROID_KEY_ALIAS -file $certificatePath
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read the configured signing certificate.' }
    $expectedDigest = (Get-FileHash -LiteralPath $certificatePath -Algorithm SHA256).Hash.ToLowerInvariant()
    $signature = & $java -jar "$buildTools/lib/apksigner.jar" verify --verbose --print-certs $apk
    if ($LASTEXITCODE -ne 0 -or !(($signature -join "`n").Contains("certificate SHA-256 digest: $expectedDigest"))) { throw 'APK signature does not match the upload key.' }
    $badging = & "$buildTools/aapt.exe" dump badging $apk
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read APK metadata.' }
    foreach ($expected in @("name='org.hjennerway.escape1829.prototype'", "versionCode='$env:ANDROID_VERSION_CODE'", "versionName='$env:ANDROID_VERSION_NAME'", "native-code: 'arm64-v8a'")) {
        if (!(($badging -join "`n").Contains($expected))) { throw "APK metadata mismatch: $expected" }
    }
    # Self-signed upload keys are normal. Verify the archive, then separately
    # compare its signing certificate with the configured upload key.
    # Quote the dotted JVM property: PowerShell otherwise splits it into
    # -J-Duser and .language=en, which jarsigner treats as the archive path.
    $verification = & $jarsigner '-J-Duser.language=en' -verify -verbose -certs $aab
    if ($LASTEXITCODE -ne 0 -or !(($verification -join "`n") -match 'jar verified\.')) {
        $verification | Select-Object -Last 25 | Write-Output
        throw 'AAB signature verification failed.'
    }
    $bundleCertificate = & $keytool -printcert -jarfile $aab -rfc
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read AAB signing certificate.' }
    $pem = ($bundleCertificate -join "`n")
    $match = [regex]::Match($pem, '-----BEGIN CERTIFICATE-----\s*([A-Za-z0-9+/=\s]+)-----END CERTIFICATE-----')
    if (!$match.Success) { throw 'AAB has no signing certificate.' }
    # Keep verification compatible with the runner's built-in Windows PowerShell.
    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        $bundleDigest = [BitConverter]::ToString($sha256.ComputeHash([Convert]::FromBase64String($match.Groups[1].Value))).Replace('-', '').ToLowerInvariant()
    } finally { $sha256.Dispose() }
    if ($bundleDigest -ne $expectedDigest) { throw 'AAB signer differs from the upload key.' }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($aab)
    try {
        foreach ($entry in @('BundleConfig.pb','base/manifest/AndroidManifest.xml','base/lib/arm64-v8a/libil2cpp.so')) {
            if (!$archive.GetEntry($entry)) { throw "Missing AAB entry: $entry" }
        }
    } finally { $archive.Dispose() }
    [ordered]@{
        versionName = $env:ANDROID_VERSION_NAME
        versionCode = [int]$env:ANDROID_VERSION_CODE
        applicationId = 'org.hjennerway.escape1829.prototype'
        certificateSha256 = $expectedDigest
        packages = @($apk, $aab) | ForEach-Object { @{ file = Split-Path $_ -Leaf; bytes = (Get-Item -LiteralPath $_).Length; sha256 = (Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash } }
    } | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $nativeRoot 'out/android-release.json')
} finally {
    Remove-Item -LiteralPath $certificatePath -Force -ErrorAction SilentlyContinue
}
