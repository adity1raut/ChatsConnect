import os
import re
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from routers.ai_router import router as ai_router

app = FastAPI(
    title="ChatConnect AI Service",
    description="LangChain + LangGraph powered AI microservice for ChatConnect",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Named origins from env (production domains + explicit localhost ports)
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5000,http://localhost:5173,http://localhost:5174",
)
explicit_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

# In addition, allow any localhost / 127.0.0.1 port (for Vite dev server)
_LOCALHOST_RE = re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$")


class DynamicCORSMiddleware(BaseHTTPMiddleware):
    """Allow any localhost origin in addition to the explicit allowed list."""

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        is_allowed = origin in explicit_origins or bool(_LOCALHOST_RE.match(origin))

        if request.method == "OPTIONS" and is_allowed:
            return Response(
                status_code=204,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                },
            )

        response = await call_next(request)
        if is_allowed:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


app.add_middleware(DynamicCORSMiddleware)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(ai_router)


@app.get("/")
async def root():
    return {"message": "ChatConnect AI Service is running", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
