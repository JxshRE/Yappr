import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

DOTENV = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=DOTENV)

class Settings(BaseSettings):
    SECRET_KEY: str
    DB_CONNECTION: str
    model_config = SettingsConfigDict(env_file=DOTENV, env_file_encoding="utf-8-sig")



settings = Settings()