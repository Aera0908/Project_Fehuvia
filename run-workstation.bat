@echo off
title Fehuvia Workstation Controller
echo ====================================================
echo Starting Fehuvia B2B SME Treasury Workstation...
echo ====================================================

echo [1/3] Starting Local Hardhat Blockchain Node...
start "Fehuvia L2 Node" /D "%~dp0contracts" cmd /k "npx hardhat node"

echo [2/3] Starting Express Backend API (Port 3001)...
start "Fehuvia Backend API" /D "%~dp0backend" cmd /k "node index.js"

echo [3/3] Starting Vite Frontend Workstation (Port 5173)...
start "Fehuvia Frontend Workstation" /D "%~dp0frontend" cmd /k "npm run dev"

echo ====================================================
echo All services launched in separate windows!
echo ====================================================
pause
