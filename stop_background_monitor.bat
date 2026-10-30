@echo off
echo ========================================================
echo   Stopping VYBE AI Background Desktop Monitor
echo ========================================================
echo.

if exist "backend\desktop_agent.pid" (
    set /p AGENT_PID=<"backend\desktop_agent.pid"
    taskkill /F /PID %AGENT_PID% 2>nul
    del "backend\desktop_agent.pid" 2>nul
    echo [OK] Background monitor process stopped.
) else (
    taskkill /F /IM pythonw.exe 2>nul
    echo [OK] Attempted to stop background pythonw processes.
)

echo.
