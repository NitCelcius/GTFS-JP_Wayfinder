import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gtfs_jp_wayfinder.routers import path, stops, trips
from gtfs_jp_wayfinder.services import wayfinder_adapter

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
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

    yield

    # Optional: place for shutdown/cleanup if needed


# Create FastAPI app with async lifespan and include routers
app = FastAPI(title="GTFS-JP Wayfinder API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
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
