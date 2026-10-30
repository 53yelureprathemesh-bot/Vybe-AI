@echo off
setlocal
echo Starting VYBE AI Vite Frontend Dev Server (Port 3000)...
set "PATH=C:\Program Files\nodejs;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310\Scripts;%PATH%"

cd /d "%~dp0frontend"
npm.cmd run dev
