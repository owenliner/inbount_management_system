"""FastAPI main application entry point."""

import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api.v1 import api_router


def _get_frontend_dist() -> Optional[Path]:
    """Resolve the frontend dist directory."""
    if getattr(sys, "frozen", False):
        # Running inside PyInstaller bundle
        base = Path(sys._MEIPASS)
    else:
        # Development: relative to backend/
        base = Path(__file__).resolve().parent.parent.parent
    dist = base / "frontend" / "dist"
    if dist.is_dir():
        return dist
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Clean up resources if needed


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Warehouse Inbound Management System API",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}


# Mount frontend static files and SPA fallback
_frontend_dist = _get_frontend_dist()
if _frontend_dist:
    # Serve static assets (js, css, images, etc.)
    app.mount("/assets", StaticFiles(directory=_frontend_dist / "assets"), name="static-assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        """Serve frontend SPA — return index.html for all non-API routes."""
        # Try to serve the exact file first (e.g. favicon.ico, manifest.json)
        file_path = (_frontend_dist / full_path).resolve()
        if full_path and file_path.is_file() and str(file_path).startswith(str(_frontend_dist)):
            return FileResponse(file_path)
        # Otherwise return index.html for SPA client-side routing
        return FileResponse(_frontend_dist / "index.html")
else:
    @app.get("/")
    async def root():
        """Root endpoint (no frontend build found)."""
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "version": settings.APP_VERSION,
            "docs": f"{settings.API_V1_PREFIX}/docs",
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
