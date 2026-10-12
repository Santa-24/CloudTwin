@echo off
echo Starting CloudTwin Platform...
echo 1. Starting FastAPI Backend on http://localhost:8000
start "CloudTwin Backend" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo 2. Starting Next.js Frontend on http://localhost:3000
cd frontend
npm run dev
