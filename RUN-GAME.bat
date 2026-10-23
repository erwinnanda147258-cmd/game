@echo off
setlocal
cd /d "%~dp0"
if /i "%~1"=="server" goto server

:direct
if not exist "%~dp0Shadow-Rift-Last-Eclipse.html" goto missing
start "" "%~dp0Shadow-Rift-Last-Eclipse.html"
exit /b 0

:server
if not exist "%~dp0serve.py" goto missing
py -3 -c "import sys; sys.exit(sys.version_info[:2] < (3,8))" >nul 2>&1
if not errorlevel 1 goto pyserver
python -c "import sys; sys.exit(sys.version_info[:2] < (3,8))" >nul 2>&1
if not errorlevel 1 goto pythonserver
echo Python 3.8+ not found. Opening the standalone HTML instead.
echo No installation or Internet connection is needed for the HTML version.
goto direct

:pyserver
py -3 "%~dp0serve.py"
if errorlevel 1 goto servererror
exit /b 0

:pythonserver
python "%~dp0serve.py"
if errorlevel 1 goto servererror
exit /b 0

:servererror
echo Server could not start. Open Shadow-Rift-Last-Eclipse.html directly.
pause
exit /b 1

:missing
echo Game files not found. Extract the complete ZIP before running this file.
pause
exit /b 1
