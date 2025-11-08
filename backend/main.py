from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import financial_analysis

app = FastAPI(
    title="Smart Financial Ratio Analyzer API",
    description="API for analyzing financial statements using OCR and AI",
    version="1.0.0"
)

# Configure CORS to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(
    financial_analysis.router, 
    prefix="/api/v1", 
    tags=["financial-analysis"]
)

@app.get("/")
async def root():
    return {
        "message": "Smart Financial Ratio Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "financial-analyzer-api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
