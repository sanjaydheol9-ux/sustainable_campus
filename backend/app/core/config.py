from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_origin: str = "http://localhost:5173"
    ai_enabled: bool = True
    ai_provider: str = "gemini"
    gemini_api_key: str = "replace_me"
    ai_model: str = "gemini-2.5-flash"
    ai_timeout_seconds: int = 12
    ai_max_retries: int = 1
    demo_mode: str = "demo"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
