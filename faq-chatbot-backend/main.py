from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import chat, faqs

load_dotenv()

app = FastAPI(
    title="FAQ Chatbot API",
    description="AI-powered chatbot with RAG using Pinecone",
    version="1.0.0"
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(faqs.router, prefix="/api/v1", tags=["faqs"])

@app.get("/")
async def root():
    return {
        "message": "FAQ Chatbot API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
