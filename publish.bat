@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║            🚀 WhatsApp API Auto Deploy Script 🚀              ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Farben für die Ausgabe
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

:: Prüfe ob wir in einem UNC-Pfad sind und nutze WSL
echo %CD% | findstr /C:"\\wsl.localhost" >nul
if %errorlevel% equ 0 (
    echo %YELLOW%📍 Detected WSL path, using WSL bash for execution...%RESET%
    wsl bash -c "cd '/home/seblo/Nishi API/wa-api' && ./publish.sh"
    pause
    exit /b %errorlevel%
)

:: Ins Skript-Verzeichnis wechseln
cd /d "%~dp0"

:: Schritt 1: NPM Build
echo %BLUE%[1/5] 📦 Building project...%RESET%
call npm run build
if errorlevel 1 (
    echo %RED%❌ Build failed! Please fix errors and try again.%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Build successful!%RESET%
echo.

:: Schritt 2: Git Status prüfen
echo %BLUE%[2/5] 📋 Checking Git status...%RESET%
git status --short
echo.

:: Schritt 3: Commit Message eingeben
set /p "commit_msg=%YELLOW%💬 Enter commit message (or press Enter for default): %RESET%"
if "!commit_msg!"=="" (
    set "commit_msg=Update wa-api with new features"
)
echo.

:: Schritt 4: Git Add, Commit, Push
echo %BLUE%[3/5] 📤 Committing and pushing to Git...%RESET%
git add .
git commit -m "!commit_msg!"
if errorlevel 1 (
    echo %YELLOW%⚠️  Nothing to commit or commit failed%RESET%
) else (
    echo %GREEN%✅ Committed successfully!%RESET%
)

git push
if errorlevel 1 (
    echo %RED%❌ Git push failed!%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Pushed to Git successfully!%RESET%
echo.

:: Schritt 5: NPM Publish (optional)
echo %BLUE%[4/5] 📢 NPM Publish%RESET%
set /p "do_publish=%YELLOW%Do you want to publish to NPM? (y/N): %RESET%"
if /i "!do_publish!"=="y" (
    echo %BLUE%Publishing to NPM...%RESET%
    npm publish --access public
    if errorlevel 1 (
        echo %RED%❌ NPM publish failed!%RESET%
        echo %YELLOW%💡 Tip: Make sure you're logged in with 'npm login'%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%✅ Published to NPM successfully!%RESET%
) else (
    echo %YELLOW%⏭️  Skipping NPM publish%RESET%
)
echo.

:: Fertig
echo.
echo %GREEN%╔═══════════════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║                    ✨ Deployment Complete! ✨                 ║%RESET%
echo %GREEN%╚═══════════════════════════════════════════════════════════════╝%RESET%
echo.
echo %BLUE%Summary:%RESET%
echo   • Build: %GREEN%✓%RESET%
echo   • Git Push: %GREEN%✓%RESET%
if /i "!do_publish!"=="y" (
    echo   • NPM Publish: %GREEN%✓%RESET%
) else (
    echo   • NPM Publish: %YELLOW%Skipped%RESET%
)
echo.
pause
