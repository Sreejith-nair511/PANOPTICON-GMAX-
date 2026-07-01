# PANOPTICON Quick Start Script
# Starts both frontend and backend services

Write-Host "🔷 PANOPTICON Forensic Intelligence Platform" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check if Docker services are running
Write-Host "Checking Docker services..." -ForegroundColor Yellow
$dockerServices = docker ps --filter "name=panopticon" --format "{{.Names}}" 2>$null

if ($dockerServices) {
    Write-Host "✅ Docker services running:" -ForegroundColor Green
    $dockerServices | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
} else {
    Write-Host "⚠️  Docker services not running. Starting..." -ForegroundColor Yellow
    Set-Location docker
    docker-compose up -d
    Set-Location ..
    Start-Sleep -Seconds 5
    Write-Host "✅ Docker services started" -ForegroundColor Green
}

Write-Host ""

# Start Backend
Write-Host "Starting backend server (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
Write-Host "✅ Backend starting on http://localhost:8000" -ForegroundColor Green
Write-Host "   API Docs: http://localhost:8000/docs`n" -ForegroundColor Gray

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting frontend server (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"
Write-Host "✅ Frontend starting on http://localhost:3000`n" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host "==========================================`n" -ForegroundColor Cyan
Write-Host "🚀 PANOPTICON is starting up!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Login Credentials:" -ForegroundColor White
Write-Host "   Email:    analyst@panopticon.gov" -ForegroundColor Gray
Write-Host "   Password: demo1234`n" -ForegroundColor Gray
Write-Host "🌐 Access the application at: http://localhost:3000" -ForegroundColor White
Write-Host "📖 API Documentation at: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  Press any key to exit (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
