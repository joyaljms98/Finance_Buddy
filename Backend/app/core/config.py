from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Finance Buddy API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # JWT Settings
    SECRET_KEY: str = "this_is_a_super_secret_temporary_key_for_development"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # MongoDB Settings
    MONGODB_URI: str
    DATABASE_NAME: str = "finance_buddy_db"

    # AI Settings
    OLLAMA_HOST: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # UI Env variables mapped from the frontend/demonstration dotfiles
    NEXT_PUBLIC_ADMIN_NAME: str = "Super Admin"
    NEXT_PUBLIC_ADMIN_EMAIL: str = "imadmin007@fb.com"
    NEXT_PUBLIC_ADMIN_PASSWORD: str = "12345678"
    NEXT_PUBLIC_DEMO_EDITOR_NAME: str = "Super Editor"
    NEXT_PUBLIC_DEMO_EDITOR_EMAIL: str = "imeditor1@fb.com"
    NEXT_PUBLIC_DEMO_EDITOR_PASSWORD: str = "12345678"
    NEXT_PUBLIC_DEMO_USER_NAME: str = "Super User"
    NEXT_PUBLIC_DEMO_USER_EMAIL: str = "imuser1@fb.com"
    NEXT_PUBLIC_DEMO_USER_PASSWORD: str = "12345678"

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
