param([ValidateSet('Prepare','Windows','Android')][string]$Target = 'Android', [string]$UnityPath)
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
    & node (Join-Path $PSScriptRoot 'export-port.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Native asset export failed.' }
    & node (Join-Path $PSScriptRoot 'test-port.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Native asset validation failed.' }
    New-Item -ItemType Directory -Force -Path (Join-Path $nativeRoot 'artifacts') | Out-Null
    $method = "NativePrototypeBuild.$Target"
    $log = Join-Path $nativeRoot "artifacts/unity-$($Target.ToLower()).log"
    $arguments = @('-batchmode','-quit','-projectPath',(Join-Path $nativeRoot 'Unity'),'-executeMethod',$method,'-logFile',$log)
    if ($Target -eq 'Android') { $arguments += @('-buildTarget','Android') }
    if ($Target -eq 'Windows') { $arguments += @('-buildTarget','Win64') }
    $unityProcess = Start-Process -FilePath $UnityPath -ArgumentList $arguments -WindowStyle Hidden -PassThru -Wait
    if ($unityProcess.ExitCode -ne 0) {
        Get-Content -LiteralPath $log -Tail 65
        throw "Unity $Target failed; see $log"
    }
    if ($Target -eq 'Android' -and !(Test-Path (Join-Path $nativeRoot 'out/escape-1829-native.apk'))) { throw 'Unity exited without producing the APK; inspect its log.' }
    Write-Output "Native $Target completed. Log: $log"
} finally { Pop-Location }
