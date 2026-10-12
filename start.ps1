Write-Host "Starting CloudTwin Platform..." -ForegroundColor Cyan

# Start FastAPI Backend in background
Write-Host "Launching Backend API on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

# Start Next.js Frontend
Write-Host "Launching Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location frontend
npm run dev
