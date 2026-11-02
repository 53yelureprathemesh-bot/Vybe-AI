@echo off
set "PATH=C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310\Scripts;%PATH%"
set "PYTHONPATH=e:\vybe ai\backend"
cd /d "e:\vybe ai\backend"
python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
