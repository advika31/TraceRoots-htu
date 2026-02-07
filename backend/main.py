# # backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from database import engine, Base
from routes import auth, farmers, batches, regulator, processor, consumer, surplus, ai, blockchain

Base.metadata.create_all(bind=engine)
load_dotenv(dotenv_path=".env", override=True)
app = FastAPI(title="TraceRoots API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/reports", exist_ok=True)
os.makedirs("static/qr", exist_ok=True)
os.makedirs("static/generated_videos", exist_ok=True)
os.makedirs("static/audio", exist_ok=True)

# ✅ MOUNT STATIC ONLY ONCE
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(batches.router)
app.include_router(regulator.router)
app.include_router(processor.router)
app.include_router(consumer.router)
app.include_router(surplus.router)
app.include_router(ai.router)
app.include_router(blockchain.router)

@app.get("/")
def home():
    return {
        "status": "Online",
        "modules": ["Farmer", "Regulator", "Processor", "Consumer"],
        "version": "1.0.0"
    }
