$ErrorActionPreference = "Stop"

function Test-CommandExists {
  param([string]$CommandName)

  return $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

if (Test-Path "$HOME\.local\bin") {
  $env:PATH = "$HOME\.local\bin;" + $env:PATH
}

if (-not (Test-CommandExists "uv")) {
  Write-Error "Missing required command: uv. Please install uv or check your installation."
}

if (-not (Test-CommandExists "pnpm")) {
  Write-Error "Missing required command: pnpm"
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"

# Start each service in its own PowerShell window so logs remain visible.
if (Test-CommandExists "livekit-server") {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$repoRoot'; livekit-server --dev"
} else {
  Write-Warning "livekit-server was not found. Skipping local LiveKit startup and using your configured LIVEKIT_URL instead."
}

$pathEnvCmd = "if (Test-Path '$HOME\.local\bin') { `$env:PATH = '$HOME\.local\bin;' + `$env:PATH };"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$pathEnvCmd Set-Location -LiteralPath '$backendDir'; uv run python src/agent.py dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$frontendDir'; pnpm dev"

Write-Host "Started backend and frontend in separate PowerShell windows."
