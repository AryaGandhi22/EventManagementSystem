@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo College Event Management - Backend Setup
echo ==========================================

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo Created .env from .env.example
    echo Edit .env and add your MongoDB Atlas URI before continuing.
    echo.
    pause
)

if not exist "venv\Scripts\python.exe" (
    echo Creating Python virtual environment...
    py -m venv venv
)

call venv\Scripts\activate.bat

echo Installing backend dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo Running Django checks...
python manage.py check

echo Applying MongoDB migrations...
python manage.py migrate

echo.
echo Backend is ready at http://127.0.0.1:8000/
echo Health: http://127.0.0.1:8000/api/events/health/
echo.
echo Starting Django...
python manage.py runserver
