from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.preview import router as preview_router
import logging
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI(
    title="Facade AI Service",
    description="Image segmentation and facade texture replacement",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(preview_router)


@app.get("/")
def root():
    return {"service": "Facade AI", "docs": "/docs"}
