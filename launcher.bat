@echo off
setlocal enabledelayedexpansion
title Finance Buddy Launcher
color 0B

echo ===========================================
echo       Finance Buddy Presentation Setup
echo ===========================================
echo.

set "BASE_DIR=%~dp0"
if "%BASE_DIR:~-1%"=="\" set "BASE_DIR=%BASE_DIR:~0,-1%"
echo Found Project Directory: "%BASE_DIR%"
echo.

:: =====================================================================
:: Step 0: Ensure Python & Node.js exist
:: =====================================================================

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in PATH.
    echo Please install Python 3.x and enable "Add to PATH".
    pause
    exit /b
)
echo [OK] Python found.

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js npm not found in PATH.
    echo Please install Node.js and enable "Add to PATH".
    pause
    exit /b
)
echo [OK] Node.js (npm) found.
echo.

:: =====================================================================
:: Step 0.5: Check Ollama Status
:: =====================================================================
echo [SETUP] Checking Ollama AI Status...
curl -s --max-time 1 http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is running and active!
) else (
    echo [WARNING] Ollama is NOT running. Offline AI features will fallback to Gemini.
)
echo.


:: =====================================================================
:: Step 0.7: Select Database Connection
:: =====================================================================
echo [SETUP] Please select the MongoDB environment:
echo 1) MongoDB Atlas (Cloud Cluster 0)
echo 2) MongoDB Compass (Local Offline)
set /p "db_mode=Enter choice (1/2) [Default: 1]: "
if "%db_mode%"=="" set "db_mode=1"

set "ENV_FILE=%BASE_DIR%\Backend\.env"
if "%db_mode%"=="2" (
    echo [DB] Modifying backend environment to use MongoDB Compass ^(Local^)...
    powershell -Command "(Get-Content -Path '%ENV_FILE%') -replace '^MONGODB_URI=.*', ('MONGODB_URI=' + [char]34 + 'mongodb://localhost:27017/' + [char]34) | Set-Content -Path '%ENV_FILE%'"
) else (
    echo [DB] Modifying backend environment to use MongoDB Atlas ^(Cloud^)...
    powershell -Command "(Get-Content -Path '%ENV_FILE%') -replace '^MONGODB_URI=.*', ('MONGODB_URI=' + [char]34 + 'mongodb+srv://<username>:<password>@cluster0.ubu4x7s.mongodb.net/?appName=Cluster0' + [char]34) | Set-Content -Path '%ENV_FILE%'"
)
echo.

:: =====================================================================
:: Step 1: Setup & Launch FastAPI Backend
:: =====================================================================

set "BACKEND_DIR=%BASE_DIR%\Backend"
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend folder not found at "%BACKEND_DIR%".
    pause
    exit /b
)

echo [SETUP] Preparing FastAPI backend...
cd /d "%BACKEND_DIR%"

if not exist "venv" (
    echo [FastAPI] Creating virtual environment...
    python -m venv venv
    echo [FastAPI] Installing dependencies...
    venv\Scripts\pip install -r requirements.txt
) else (
    echo [FastAPI] Checking virtual environment...
    venv\Scripts\python --version >nul 2>&1
    if errorlevel 1 (
        echo [FastAPI] Virtual environment corrupted. Recreating...
        rmdir /s /q venv
        python -m venv venv
        venv\Scripts\pip install -r requirements.txt
    ) else (
        echo [FastAPI] Virtual environment is valid.
    )
)

echo [START] Launching FastAPI server on Port 8000...
:: We use start cmd /k to open a new terminal window for the backend
start "Finance Buddy Backend (FastAPI)" /D "%BACKEND_DIR%" cmd /k "call venv\Scripts\activate && echo [FastAPI] Starting Uvicorn... && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo.

:: =====================================================================
:: Step 2: Setup & Launch Next.js Frontend
:: =====================================================================

set "FRONTEND_DIR=%BASE_DIR%\frontend"
if not exist "%FRONTEND_DIR%" (
    echo [ERROR] Frontend folder not found at "%FRONTEND_DIR%".
    pause
    exit /b
)

echo [SETUP] Preparing Next.js frontend...
cd /d "%FRONTEND_DIR%"

echo [START] Launching Next.js server on Port 3000...
:: Run npm install (to pick up any new packages) then start dev server in the frontend window
start "Finance Buddy Frontend (Next.js)" /D "%FRONTEND_DIR%" cmd /k "echo [Frontend] Installing/syncing dependencies... && call npm install && echo [Frontend] Starting Next.js Dev Server... && call npm run dev"

echo.

:: =====================================================================
:: Step 3: Wait for Servers and Open Browser
:: =====================================================================

echo Waiting for Frontend to start (usually takes ~5 seconds)...
:WAIT_LOOP
timeout /t 2 /nobreak >nul
curl -s -f http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 goto WAIT_LOOP

echo [OK] Servers are ready!

set "FRONTEND_URL=http://localhost:3000/"

echo [OPEN] Opening %FRONTEND_URL% in Chrome...
set "CHROME_PATH="
for %%I in (
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) do (
  if exist "%%~I" set "CHROME_PATH=%%~I"
)

if defined CHROME_PATH (
  start "" "%CHROME_PATH%" "%FRONTEND_URL%"
) else (
  start "" "%FRONTEND_URL%"
)

echo.
echo ============================================
echo   [SUCCESS] Finance Buddy is now LIVE!
echo ============================================
echo.
echo FastAPI Backend:  http://127.0.0.1:8000/
echo Next.js Frontend: http://localhost:3000/
echo Demo Admin ID:    imadmin007@fb.com
echo Demo User ID:     imuser1@fb.com
echo Demo Password:    12345678
echo.
echo You can close this window. The servers are running in the background terminals.
echo ============================================
pause
endlocal
exit /b
