from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Keys
    GEMINI_API_KEY: str
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    # OCR
    OCR_CONFIDENCE_THRESHOLD: float = 0.85
    USE_GPU: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
