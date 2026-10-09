param([ValidateSet('Prepare','Windows','Android')][string]$Target = 'Android', [string]$UnityPath, [switch]$SkipExport)
$ErrorActionPreference = 'Stop'
$nativeRoot = Split-Path $PSScriptRoot -Parent
$repoRoot = Split-Path $nativeRoot -Parent
if (!$UnityPath) {
    $UnityPath = 'C:/Program Files/Unity/Hub/Editor/6000.6.3f1/Editor/Unity.exe'
}
if (!(Test-Path -LiteralPath $UnityPath)) { throw 'Unity 6000.6.3f1 not found. Pass -UnityPath with the installed editor path.' }
if (!$env:MODEL_CHROME_PATH -and (Test-Path 'C:/Program Files/Google/Chrome/Application/chrome.exe')) {
    $env:MODEL_CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
}
Push-Location $repoRoot
try {
    if (!$SkipExport) {
        & node (Join-Path $PSScriptRoot 'export-port.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Native asset export failed.' }
        & node (Join-Path $PSScriptRoot 'export-presentation.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Native presentation export failed.' }
    }
    & node (Join-Path $PSScriptRoot 'export-workshop-shader.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Native workshop shader export failed.' }
    & node (Join-Path $PSScriptRoot 'test-navigation-export.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Native collision export regression failed.' }
    & node (Join-Path $PSScriptRoot 'test-port.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Native asset validation failed.' }
    & node (Join-Path $PSScriptRoot 'test-presentation.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Native presentation validation failed.' }
    New-Item -ItemType Directory -Force -Path (Join-Path $nativeRoot 'artifacts') | Out-Null
    $method = "NativePrototypeBuild.$Target"
    $log = Join-Path $nativeRoot "artifacts/unity-$($Target.ToLower()).log"
    $arguments = @('-batchmode','-quit','-projectPath',(Join-Path $nativeRoot 'Unity'),'-executeMethod',$method,'-logFile',$log)
    if ($Target -eq 'Android') { $arguments += @('-buildTarget','Android') }
    if ($Target -eq 'Windows') { $arguments += @('-buildTarget','Win64') }
    $unityProcess = Start-Process -FilePath $UnityPath -ArgumentList $arguments -WindowStyle Hidden -PassThru
    # Licensing helpers can outlive the build; wait for Unity, not its process tree.
    $unityProcess.WaitForExit()
    if ($unityProcess.ExitCode -ne 0) {
        Get-Content -LiteralPath $log -Tail 65
        throw "Unity $Target failed; see $log"
    }
    if (Select-String -LiteralPath $log -Pattern 'Shader error|error CS[0-9]+' -Quiet) { throw "Unity reported a source or shader compilation error; inspect $log" }
    if (Select-String -LiteralPath $log -Pattern "Script attached to .* is missing or no valid script is attached" -Quiet) { throw "Unity built a scene with a missing script; inspect $log" }
    if ($Target -eq 'Android' -and !(Test-Path (Join-Path $nativeRoot 'out/escape-1829-native.apk'))) { throw 'Unity exited without producing the APK; inspect its log.' }
    Write-Output "Native $Target completed. Log: $log"
} finally { Pop-Location }
