import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gtfs_jp_wayfinder.routers import path, stops, trips
from gtfs_jp_wayfinder.services import wayfinder_adapter

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_cors_origins():
    """Get CORS origins from environment variable with sensible defaults."""
    cors_origins = os.getenv("CORS_ORIGINS")

    if cors_origins:
        # Check for asterisk (wildcard) - development only
        if cors_origins.strip() == "*":
            logger.warning(
                "CORS_ORIGINS is set to '*' (allow all origins). "
                "This should ONLY be used for development purposes. "
                "Never use this in production as it poses a security risk.",
            )
            return ["*"]

        # Split comma-separated origins and strip whitespace
        origins = [origin.strip() for origin in cors_origins.split(",")]
        logger.info(f"CORS origins from environment: {origins}")
        return origins

    # Default origins for development
    default_origins = [
        "http://localhost:3000",  # Next.js default
        "http://localhost:8000",  # Alternative port
        "http://localhost:8002",  # API port (for testing)
        "http://127.0.0.1:3000",  # Localhost alternative
        "http://127.0.0.1:8000",  # Localhost alternative
        "http://127.0.0.1:8002",  # Localhost alternative
    ]

    logger.warning(
        f"CORS_ORIGINS not set, using defaults: {default_origins}. "
        "Set CORS_ORIGINS environment variable for production.",
    )
    return default_origins


@asynccontextmanager
async def lifespan(_app: FastAPI):  # _app retained for FastAPI signature (ARG001)
    """Async lifespan for FastAPI so initialization runs via asyncio.to_thread.

    This allows the turborepo "uv run python -m ..." wrapper to start the
    process without blocking the event loop while heavy I/O (pandas read) runs.
    """
    data_dir = "./data/gtfs-akita-chuo-kotsu/"
    try:
        # Use adapter's async initialize which delegates to the blocking initializer
        await wayfinder_adapter.initialize(data_dir)
        logger.info("Wayfinder initialized (async lifespan)")
    except Exception:
        logger.exception("Wayfinder initialization failed")
        raise

    yield  # TODO(ARG): use _app for shutdown hooks if needed

    # Optional: place for shutdown/cleanup if needed


# Create FastAPI app with async lifespan and include routers
app = FastAPI(title="GTFS-JP Wayfinder API", lifespan=lifespan)

# Configure CORS with special handling for wildcard
cors_origins = get_cors_origins()
if cors_origins == ["*"]:
    # FastAPI requires allow_origin_regex for wildcard CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",  # Match all origins
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(stops.router, prefix="/stops", tags=["stops"])
app.include_router(trips.router, prefix="/trips", tags=["trips"])
app.include_router(path.router, prefix="/path", tags=["path"])


@app.get("/")
async def root():
    return {"message": "GTFS-JP Wayfinder API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
