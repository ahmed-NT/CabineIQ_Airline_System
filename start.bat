@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  ROYAL AIR MAROC — Airline System Startup Script
::  Starts: Discovery, Auth, Aircraft, Seat, Passenger, Flight,
::          API Gateway (backend) + React Frontend
:: ============================================================

set BASE_DIR=%~dp0
set BACKEND_DIR=%BASE_DIR%backend
set FRONTEND_DIR=%BASE_DIR%frontend-new

:: ---- Colors via ANSI (Windows 10+) -------------------------
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "RED=%ESC%[91m"
set "CYAN=%ESC%[96m"
set "RESET=%ESC%[0m"

echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%   ROYAL AIR MAROC — Airline System Launcher%RESET%
echo %CYAN%============================================================%RESET%
echo.

:: ---- Step 1: Kill existing Java processes ------------------
echo %YELLOW%[1/9] Killing any running Java processes...%RESET%
taskkill /F /IM java.exe >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%      Done — previous Java processes terminated.%RESET%
) else (
    echo       No Java processes were running.
)
timeout /t 2 /nobreak >nul

:: ---- Step 2: Maven build (optional, skip with flag) --------
echo.
echo %YELLOW%[2/9] Maven build — skip? (Press S to skip, any other key to build)%RESET%
choice /C SB /N /T 8 /D S /M "      Auto-skipping in 8s... [S=Skip / B=Build]: "
if %errorlevel% == 2 (
    echo %YELLOW%      Running: mvn clean install -DskipTests ...%RESET%
    cd /d "%BACKEND_DIR%"
    call mvn clean install -DskipTests
    if %errorlevel% neq 0 (
        echo %RED%      BUILD FAILED. Fix errors and re-run.%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%      Build successful.%RESET%
) else (
    echo       Skipping Maven build.
)

:: ---- Step 3: Discovery Service (Eureka) :8761 ---------------
echo.
echo %YELLOW%[3/9] Starting Discovery Service (Eureka) on :8761 ...%RESET%
start "Discovery Service :8761" cmd /k "cd /d "%BACKEND_DIR%\discovery-service" && mvn spring-boot:run"
echo %GREEN%      Window opened — waiting 15s for Eureka to be ready...%RESET%
timeout /t 15 /nobreak >nul

:: ---- Step 4: Auth Service :8085 -----------------------------
echo.
echo %YELLOW%[4/9] Starting Auth Service on :8085 ...%RESET%
start "Auth Service :8085" cmd /k "cd /d "%BACKEND_DIR%\auth-service" && mvn spring-boot:run"
echo %GREEN%      Waiting 10s for Auth Service to register...%RESET%
timeout /t 10 /nobreak >nul

:: ---- Step 5: Aircraft Service :8081 -------------------------
echo.
echo %YELLOW%[5/9] Starting Aircraft Service on :8081 ...%RESET%
start "Aircraft Service :8081" cmd /k "cd /d "%BACKEND_DIR%\aircraft-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 6: Seat Service :8082 -----------------------------
echo.
echo %YELLOW%[6/9] Starting Seat Service on :8082 ...%RESET%
start "Seat Service :8082" cmd /k "cd /d "%BACKEND_DIR%\seat-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 7: Passenger Service :8083 ------------------------
echo.
echo %YELLOW%[7/9] Starting Passenger Service on :8083 ...%RESET%
start "Passenger Service :8083" cmd /k "cd /d "%BACKEND_DIR%\passenger-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 8: Flight Service :8084 ---------------------------
echo.
echo %YELLOW%[8/9] Starting Flight Service on :8084 ...%RESET%
start "Flight Service :8084" cmd /k "cd /d "%BACKEND_DIR%\flight-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 9: Feedback Service :8086 -------------------------
echo.
echo %YELLOW%[9/13] Starting Feedback Service on :8086 ...%RESET%
start "Feedback Service :8086" cmd /k "cd /d "%BACKEND_DIR%\feedback-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 10: AI Service :8088 ------------------------------
echo.
echo %YELLOW%[10/13] Starting AI Service on :8088 ...%RESET%
start "AI Service :8088" cmd /k "cd /d "%BACKEND_DIR%\ai-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 11: Notification Service :8089 --------------------
echo.
echo %YELLOW%[11/13] Starting Notification Service on :8089 ...%RESET%
start "Notification Service :8089" cmd /k "cd /d "%BACKEND_DIR%\notification-service" && mvn spring-boot:run"
timeout /t 8 /nobreak >nul

:: ---- Step 12: API Gateway :8080 -----------------------------
echo.
echo %YELLOW%[12/13] Starting API Gateway on :8080 ...%RESET%
start "API Gateway :8080" cmd /k "cd /d "%BACKEND_DIR%\api-gateway" && mvn spring-boot:run"
echo %GREEN%      Waiting 12s for Gateway to register with Eureka...%RESET%
timeout /t 12 /nobreak >nul

:: ---- Step 13: ML Service :8087 ------------------------------
echo.
echo %YELLOW%[13/13] Starting ML Service on :8087 ...%RESET%
start "ML Service :8087" cmd /k "cd /d "%BACKEND_DIR%\ml-service" && py -m pip install -r requirements.txt -q && py app.py"
timeout /t 3 /nobreak >nul

:: ---- React Frontend :3000 -----------------------------------
echo.
echo %CYAN%[+] Starting React Frontend ...%RESET%
start "Frontend :3000" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

:: ---- Done --------------------------------------------------
echo.
echo %GREEN%============================================================%RESET%
echo %GREEN%   ALL SERVICES LAUNCHED!%RESET%
echo %GREEN%============================================================%RESET%
echo.
echo   Service endpoints:
echo   %CYAN%Eureka Dashboard  →  http://localhost:8761%RESET%
echo   %CYAN%API Gateway       →  http://localhost:8080%RESET%
echo   %CYAN%Auth Service      →  http://localhost:8085%RESET%
echo   %CYAN%Aircraft Service  →  http://localhost:8081%RESET%
echo   %CYAN%Seat Service      →  http://localhost:8082%RESET%
echo   %CYAN%Passenger Service →  http://localhost:8083%RESET%
echo   %CYAN%Flight Service    →  http://localhost:8084%RESET%
echo   %CYAN%Feedback Service  →  http://localhost:8086%RESET%
echo   %CYAN%AI Service        →  http://localhost:8088%RESET%
echo   %CYAN%Notification Svc  →  http://localhost:8089%RESET%
echo   %CYAN%ML Service        →  http://localhost:8087%RESET%
echo   %CYAN%Frontend (React)  →  http://localhost:3000%RESET%
echo.
echo   %YELLOW%Tip: Check Eureka at :8761 — all services should appear.%RESET%
echo   %YELLOW%     Wait ~30s after this window for all services to fully start.%RESET%
echo.

:: Open Eureka in browser after a short wait
timeout /t 5 /nobreak >nul
start http://localhost:8761

pause
endlocal
