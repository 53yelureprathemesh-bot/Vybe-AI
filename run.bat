@echo off
setlocal
echo ========================================================
echo               VYBE AI - WORKPLACE WELLNESS
echo      "Your Work. Your Wellness. Your Rhythm."
echo ========================================================
echo.

rem Add paths for Node and Python
set "PATH=C:\Program Files\nodejs;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310\Scripts;%PATH%"

echo Starting VYBE AI Fullstack Application...
echo.
echo Standalone Server: http://localhost:8000
echo.

cd /d "%~dp0backend"
set PYTHONPATH=%~dp0backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
