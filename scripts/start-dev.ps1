# Start WWM backend and frontend for development
# Run: .\scripts\start-dev.ps1
# Or open two terminals and run:
#   Terminal 1: cd backend && npm run dev
#   Terminal 2: cd frontend && npm run dev

Write-Host "Starting Walk With Me (WWM)..." -ForegroundColor Gold
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; Write-Host 'Backend starting...' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 3

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; Write-Host 'Frontend starting...' -ForegroundColor Cyan; npm run dev"

Write-Host "Backend: http://localhost:4000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Yellow
