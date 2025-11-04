import logging
from fastapi import FastAPI, Response
from apscheduler.schedulers.background import BackgroundScheduler
from app.api import auth, users
from app.api import readings
from app.core.backup import upload_to_s3
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


def backup_job():
    bucket_name = settings.S3_BUCKET_NAME
    db_file_path = settings.DATABASE_FILE_PATH
    object_name = db_file_path.split("/")[-1]
    if bucket_name:
        logging.info("Starting database backup to S3...")
        upload_to_s3(db_file_path, bucket_name, object_name)
    else:
        logging.error("S3_BUCKET_NAME environment variable not set. Backup skipped.")

scheduler = BackgroundScheduler()
scheduler.add_job(backup_job, 'interval', hours=4)

@app.on_event("startup")
def start_scheduler():
    scheduler.start()
    logging.info("Scheduler started.")

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
    logging.info("Scheduler shut down.")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(readings.router, prefix="/api", tags=["Readings"])

logging.basicConfig(
    level=logging.INFO
)


@app.get("/health")
async def health_check():
    return Response(status_code=200, content="App is healthy")
