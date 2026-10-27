@echo off
title Smart Campus Resource & Energy Management System
echo =====================================================================
echo    SMART CAMPUS RESOURCE AND ENERGY MANAGEMENT SYSTEM (Full-Stack)
echo    Frontend: React.js + Vite + Tailwind CSS + Recharts
echo    Backend:  Node.js + Express + PostgreSQL Simulation Engine
echo =====================================================================
echo.
echo Starting Backend Server on http://localhost:5000 ...
start "Smart Campus Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && npm.cmd start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Vite Client on http://localhost:5173 ...
start "Smart Campus Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

echo.
echo =====================================================================
echo    Both servers have been launched in separate terminal windows!
echo    👉 Open your browser at: http://localhost:5173
echo    👉 Backend API running at: http://localhost:5000
echo =====================================================================
pause
