# Optional local tool setup. Downloads Microsoft's pinned SDK tools into this
# project's ignored cache; does not install an SDK or change machine settings.
$ErrorActionPreference = 'Stop'
$desktopRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$cacheRoot = Join-Path $desktopRoot '.cache'
$sdkRoot = Join-Path $cacheRoot 'windows-sdk'
$sdkVersion = '10.0.28000.2705'
$packageBase = "https://api.nuget.org/v3-flatcontainer/microsoft.windows.sdk.buildtools/$sdkVersion/microsoft.windows.sdk.buildtools.$sdkVersion.nupkg"
$archivePath = Join-Path $cacheRoot "windows-sdk-$sdkVersion.zip"
New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null
$expected = '8BFDFB6CA2633F531CF80B5FA22512BA61A394D7988F0970DB83BAADC67929ED'
if (!(Test-Path -LiteralPath $archivePath) -or (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $expected) {
    Invoke-WebRequest -Uri $packageBase -OutFile $archivePath
}
if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $expected) { throw 'Windows SDK download checksum mismatch.' }
Expand-Archive -LiteralPath $archivePath -DestinationPath $sdkRoot -Force
Write-Output "Windows packaging tools available at $sdkRoot"
