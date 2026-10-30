@echo off
echo ========================================================
echo   Starting VYBE AI Background Desktop Monitor
echo ========================================================
echo.
echo Running silently in the background of your PC/laptop...
echo It will monitor screen time across all desktop applications
echo and send Windows Toast notifications for stretches, hydration, and breaks.
echo.

set PATH=C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;%PATH%
start "" pythonw "backend\desktop_agent.py"

echo [OK] Background monitor is now ACTIVE!
echo To stop it anytime, run stop_background_monitor.bat
echo.
