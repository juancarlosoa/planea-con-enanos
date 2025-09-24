@echo off
echo Starting Escape Room Planner Development Environment...

echo Starting .NET API...
start "API" cmd /k "dotnet run --project src/EscapeRoomPlanner.Api"

timeout /t 3 /nobreak >nul

echo Starting React frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Development environment started!
echo API: https://localhost:7001
echo Frontend: http://localhost:5173
pause