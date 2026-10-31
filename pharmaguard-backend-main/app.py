# Re-export the complete, unified PharmaGuard FastAPI app
from main import app, predict, analyze, ai_insights

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
