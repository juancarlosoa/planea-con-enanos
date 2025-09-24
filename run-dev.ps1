# Development startup script for Windows PowerShell

Write-Host "Starting Escape Room Planner Development Environment..." -ForegroundColor Green

# Start the backend API
Write-Host "Starting .NET API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; dotnet run --project src/EscapeRoomPlanner.Api"

# Wait a moment for the API to start
Start-Sleep -Seconds 3

# Start the frontend
Write-Host "Starting React frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/frontend'; npm run dev"

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "API: https://localhost:7001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")