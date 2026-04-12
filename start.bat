@echo off
echo.
echo  ==========================================
echo    CineRecML - Movie Recommender
echo  ==========================================
echo.

:: ---------- Backend ----------
if not exist "venv\Scripts\activate" (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate

echo Installing backend dependencies...
pip install -r backend\requirements.txt -q

:: Run preprocessing if the pickle doesn't exist yet
if not exist "backend\processed_df.pkl" (
    echo.
    echo Running data preprocessing for the first time...
    echo Make sure tmdb_5000_movies.csv and tmdb_5000_credits.csv are in the backend\ folder.
    echo.
    cd backend
    python preprocess.py
    cd ..
)

echo Starting FastAPI backend on port 8000...
start "CineRecML-Backend" /MIN cmd /c "venv\Scripts\activate && cd backend && uvicorn main:app --host 127.0.0.1 --port 8000"

timeout /t 4 /nobreak > NUL

:: ---------- Frontend ----------
echo Starting React frontend on port 5173...
cd frontend
npm run dev

pause
