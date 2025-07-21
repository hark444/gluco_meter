import logging
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware


logging.basicConfig(
    level=logging.INFO
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
async def health_check():
    return Response(status_code=200, content="App is healthy")
