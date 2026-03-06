import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.ai_router import router as ai_router

app = FastAPI(
    title="ChatConnect AI Service",
    description="LangChain + LangGraph powered AI microservice for ChatConnect",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5000,http://localhost:5173",
)
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(ai_router)


@app.get("/")
async def root():
    return {"message": "ChatConnect AI Service is running", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
