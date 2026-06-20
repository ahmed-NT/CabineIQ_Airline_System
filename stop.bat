@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  ROYAL AIR MAROC — Airline System Stop Script
::  Stops all backend services and React frontend
:: ============================================================

:: ---- Colors via ANSI (Windows 10+) -------------------------
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "RED=%ESC%[91m"
set "CYAN=%ESC%[96m"
set "RESET=%ESC%[0m"

echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%   ROYAL AIR MAROC — Airline System Shutdown%RESET%
echo %CYAN%============================================================%RESET%
echo.

:: ---- Step 1: Kill all Java processes (all Spring Boot services) ----
echo %YELLOW%[1/3] Stopping all Java/Spring Boot services...%RESET%
taskkill /F /IM java.exe >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%      Done — all Java processes terminated.%RESET%
    echo %GREEN%      Stopped: Discovery, Auth, Aircraft, Seat, Passenger, Flight, Gateway%RESET%
) else (
    echo       No Java processes were running.
)

:: ---- Step 2: Kill Node.js (React frontend / Vite) -----------------
echo.
echo %YELLOW%[2/4] Stopping React frontend (Node.js / Vite)...%RESET%
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%      Done — Node.js process terminated.%RESET%
) else (
    echo       No Node.js processes were running.
)

:: ---- Step 3: Kill Python (ML service) ----------------------------
echo.
echo %YELLOW%[3/4] Stopping ML service (Python)...%RESET%
taskkill /F /IM python.exe >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%      Done — Python process terminated.%RESET%
) else (
    echo       No Python processes were running.
)

:: ---- Step 4: Close all service terminal windows ------------------
echo.
echo %YELLOW%[4/4] Closing service terminal windows...%RESET%
taskkill /F /FI "WINDOWTITLE eq Discovery Service :8761" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Auth Service :8085" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Aircraft Service :8081" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Seat Service :8082" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Passenger Service :8083" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Flight Service :8084" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Feedback Service :8086" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq AI Service :8088" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Notification Service :8089" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq API Gateway :8080" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq ML Service :8087" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend :3000" >nul 2>&1
echo %GREEN%      Done — all terminal windows closed.%RESET%

:: ---- Done ----------------------------------------------------
echo.
echo %GREEN%============================================================%RESET%
echo %GREEN%   ALL SERVICES STOPPED SUCCESSFULLY%RESET%
echo %GREEN%============================================================%RESET%
echo.
echo   %CYAN%Ports freed: 8761, 8085, 8081, 8082, 8083, 8084, 8086, 8087, 8088, 8089, 8080, 3000%RESET%
echo.
echo   %YELLOW%Run start.bat to restart all services.%RESET%
echo.

timeout /t 3 /nobreak >nul
endlocal
