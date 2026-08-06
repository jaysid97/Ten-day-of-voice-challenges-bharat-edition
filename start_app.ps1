$scriptPath = Join-Path $PSScriptRoot "murf-livekit-starter\start_app.ps1"
if (Test-Path $scriptPath) {
    & $scriptPath
} else {
    Write-Error "Could not find murf-livekit-starter\start_app.ps1"
}
