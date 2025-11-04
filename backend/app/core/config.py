import os

class Settings:
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./glucoapp.db")
    DATABASE_FILE_PATH: str = os.getenv("DATABASE_FILE_PATH", "./glucoapp.db")

settings = Settings()
