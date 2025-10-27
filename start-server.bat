@echo off
echo ================================
echo Starting BDMart MVC Server
echo ================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version
echo.

echo Starting server in development mode...
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
echo ================================
echo.

npm run dev
