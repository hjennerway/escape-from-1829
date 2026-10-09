param([string]$SmokeDirectory = '../artifacts/update-smoke')
$ErrorActionPreference = 'Stop'
$nativeDirectory = Split-Path $PSScriptRoot -Parent
$androidTools = 'C:/Program Files/Unity/Hub/Editor/6000.6.3f1/Editor/Data/PlaybackEngines/AndroidPlayer'
$apkPath = Join-Path $nativeDirectory 'out/escape-1829-native.apk'
$manifest = Get-Content (Join-Path $nativeDirectory 'Unity/Assets/NativePrototype/Generated/manifest.json') -Raw | ConvertFrom-Json
$smoke = Get-Content (Join-Path (Join-Path $PSScriptRoot $SmokeDirectory) 'smoke.json') -Raw | ConvertFrom-Json
$importReport = Get-Content (Join-Path $nativeDirectory 'artifacts/unity-import.json') -Raw | ConvertFrom-Json
if (!$smoke.passed -or $smoke.sourceHash -ne $manifest.sourceHash -or $importReport.sourceHash -ne $manifest.sourceHash) { throw 'Native validation and imported model hashes do not agree.' }
$badging = & "$androidTools/SDK/build-tools/36.0.0/aapt.exe" dump badging $apkPath
if ($LASTEXITCODE -ne 0) { throw 'APK metadata check failed.' }
$badging | Set-Content (Join-Path $nativeDirectory 'artifacts/update-apk-badging.txt')
$metadata = $badging -join "`n"
foreach ($expected in @("name='org.hjennerway.escape1829.prototype'", "versionCode='14'", "versionName='0.14.0'", "sdkVersion:'26'", "targetSdkVersion:'36'", "native-code: 'arm64-v8a'")) {
    if (!$metadata.Contains($expected)) { throw "Missing APK metadata: $expected" }
}
$signature = & "$androidTools/OpenJDK/bin/java.exe" -jar "$androidTools/SDK/build-tools/36.0.0/lib/apksigner.jar" verify --verbose --print-certs $apkPath
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
$signature | Set-Content (Join-Path $nativeDirectory 'artifacts/update-apk-signature.txt')
$certificate = '62fd78925199f3220228f6e79ba9967e49bf8851c7031e89d34ed19b3cec6e52'
if (!(($signature -join "`n").Contains("certificate SHA-256 digest: $certificate"))) { throw 'The signing certificate differs from v0.7.' }
if (!(($signature -join "`n").Contains('Verified using v2 scheme (APK Signature Scheme v2): true'))) { throw 'APK v2 signature is missing.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($apkPath)
$licenses = @('GPL-3.0.txt','THREE-LICENSE.txt','EZ-TREE-LICENSE.txt','TREE-TEXTURES-LICENSE.txt','LUCIDE-LICENSE.txt','FURNITURE-LICENSE.txt','ShopPrentice-MIT.txt','Panca-GPL-3.0.txt')
try {
    foreach ($license in $licenses) { if (!$archive.GetEntry("assets/Licenses/$license")) { throw "Missing attribution: $license" } }
    if (!$archive.GetEntry('lib/arm64-v8a/libil2cpp.so')) { throw 'ARM64 IL2CPP player is missing.' }
} finally { $archive.Dispose() }
$package = Get-Item -LiteralPath $apkPath
$report = [ordered]@{
    passed = $true
    package = 'org.hjennerway.escape1829.prototype'
    versionName = '0.14.0'
    versionCode = 14
    bytes = $package.Length
    sha256 = (Get-FileHash -LiteralPath $apkPath -Algorithm SHA256).Hash
    certificateSha256 = $certificate
    apkV2Verified = $true
    updateCompatibleWithPreviousBuilds = $true
    minSdk = 26
    targetSdk = 36
    abi = 'arm64-v8a'
    licenses = $licenses
    sourceHash = $manifest.sourceHash
    manifestSha256 = (Get-FileHash -LiteralPath (Join-Path $nativeDirectory 'Unity/Assets/NativePrototype/Generated/manifest.json') -Algorithm SHA256).Hash
    nativeChecks = $smoke.checks.Count
    distinctNativeChecks = @($smoke.checks | Select-Object -Unique).Count
    smoke = $SmokeDirectory + '/smoke.json'
    androidBuild = 'unity-android.log'
    deviceTested = $false
    verifiedAt = (Get-Date).ToString('o')
}
$report | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $nativeDirectory 'artifacts/update-apk-verification.json')
$report | ConvertTo-Json -Depth 4
