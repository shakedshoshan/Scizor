# Virtual Environment Activation Script
$env:PATH = ".\venv\Scripts;$env:PATH"
$env:VIRTUAL_ENV = "$PWD\venv"
Write-Host "Virtual environment activated!" -ForegroundColor Green
Write-Host "Python location: .\venv\Scripts\python.exe" -ForegroundColor Yellow 