from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    TOURIST_ID_PREFIX: str = "NE"
    TOURIST_APP_URL: str = "http://localhost:5174"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()