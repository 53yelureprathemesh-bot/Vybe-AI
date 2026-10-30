@echo off
set PATH=C:\Program Files\Git\cmd;%PATH%

echo ========================================================
echo             Push VYBE AI to GitHub
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/YourUsername/vybe-ai.git): "

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty!
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo.
echo Pushing to %REPO_URL% on branch main...
git push -u origin main

echo.
echo ========================================================
echo [DONE] Code pushed to GitHub successfully!
echo ========================================================
pause
