@echo off
TITLE JabarOOH - Server Localhost
COLOR 0A
echo ======================================================================
echo    JABAROOH ENTERPRISE - DASHBOARD PERFORMA REKLAME JAWA BARAT
echo    Pengelola: Suherman Reklame (087822248975)
echo ======================================================================
echo.
echo [1/3] Memeriksa dependensi Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terinstall di komputer ini!
    echo Silakan download dan install Node.js versi 18+ di https://nodejs.org/
    pause
    exit /b
)

echo [2/3] Memasang package (npm install jika node_modules belum ada)...
if not exist "node_modules\" (
    call npm install
)

echo [3/3] Memulai Server Localhost di http://localhost:3000 ...
echo Akun Login: suherman.reklame2012@gmail.com
echo Kata Sandi: AdminOOH@2026
echo PIN Master: 889900
echo.
echo Tekan CTRL+C untuk menghentikan server.
echo ======================================================================
call npm run dev
pause
