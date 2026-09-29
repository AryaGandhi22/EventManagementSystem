@echo off
setlocal
cd /d "%~dp0frontend"

echo Installing frontend dependencies...
npm install

echo Starting React/Vite frontend...
npm run dev
