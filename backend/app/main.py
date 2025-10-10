import logging
from fastapi import FastAPI, Response
from app.api import auth, users
from app.api import readings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


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
