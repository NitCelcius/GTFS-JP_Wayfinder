import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gtfs_jp_wayfinder.routers import agency, path, stops, trips
from gtfs_jp_wayfinder.services import wayfinder_adapter

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_cors_origins():
    """Get CORS origins from environment variable with sensible defaults.

    Priority:
    1. Explicit CORS_ORIGINS environment variable
    2. Auto-derive from VERCEL_URL if on Vercel
    3. Default localhost origins for local development
    """
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

    # Auto-derive from Vercel URL if available
    vercel_url = os.getenv("VERCEL_URL")
    if vercel_url:
        # VERCEL_URL is the deployment URL without protocol
        vercel_origins = [
            f"https://{vercel_url}",
            # Also allow the production domain if set
        ]
        # Add production URL if different
        vercel_project_production_url = os.getenv("VERCEL_PROJECT_PRODUCTION_URL")
        if vercel_project_production_url:
            vercel_origins.append(f"https://{vercel_project_production_url}")

        logger.info(f"CORS origins auto-derived from Vercel: {vercel_origins}")
        return vercel_origins

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


def get_is_cache_graph_enabled():
    """Get cache graph setting from environment variable.

    Reads the ENABLE_GRAPH_CACHE environment variable to determine if graph caching
    should be enabled. Only accepts 'true' or 'false' (case-insensitive).
    Defaults to 'false' if not set.

    When enabled, the API will cache generated NetworkX graphs to disk and
    reload them on subsequent startups, significantly reducing initialization
    time in development mode with hot-reload.

    Returns:
        bool: True if caching is enabled, False otherwise.

    Raises:
        ValueError: If ENABLE_GRAPH_CACHE is set to an invalid value (not 'true' or 'false').
    """
    cache_graph = os.getenv("ENABLE_GRAPH_CACHE", "false").lower()
    if cache_graph not in ("true", "false"):
        msg = (
            f"Invalid value for ENABLE_GRAPH_CACHE: '{cache_graph}'. "
            "Must be 'true' or 'false' (case-insensitive)."
        )
        logger.error(msg)
        raise ValueError(msg)

    enabled = cache_graph == "true"
    if enabled:
        logger.info("Graph caching is ENABLED")
        logger.warning(
            "Graph caching uses pickle serialization. Only load cache files you trust! This is not intended for production use.",
        )
    return enabled


@asynccontextmanager
async def lifespan(_app: FastAPI):  # _app retained for FastAPI signature (ARG001)
    """Async lifespan for FastAPI so initialization runs via asyncio.to_thread.

    This allows the turborepo "uv run python -m ..." wrapper to start the
    process without blocking the event loop while heavy I/O (pandas read) runs.

    In serverless mode (Vercel), loads from pre-built graph for fast cold starts.
    """
    # Check if we're in serverless mode (pre-built graph available)
    is_serverless = (
        os.getenv("VERCEL") or os.getenv("USE_PREBUILT_GRAPH", "").lower() == "true"
    )

    if is_serverless:
        # Serverless mode: data_dir is not needed, loads from pre-built graph
        data_dir = None
        use_cache_graph = False
        logger.info("Serverless mode: loading pre-built graph")
    else:
        # Traditional mode: load from GTFS files
        data_dir = os.getenv("GTFS_DATA_DIR", "./data/gtfs-akita-chuo-kotsu/")
        use_cache_graph = get_is_cache_graph_enabled()
        logger.info(f"Traditional mode: loading GTFS from {data_dir}")

    try:
        # Use adapter's async initialize which delegates to the blocking initializer
        await wayfinder_adapter.initialize(data_dir, use_cache_graph=use_cache_graph)
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

# Common CORS parameters
cors_params = {
    "allow_credentials": False,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

if cors_origins == ["*"]:
    # FastAPI requires allow_origin_regex for wildcard CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",  # Match all origins
        **cors_params,
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        **cors_params,
    )

app.include_router(agency.router, prefix="/agency", tags=["agency"])
app.include_router(stops.router, prefix="/stops", tags=["stops"])
app.include_router(trips.router, prefix="/trips", tags=["trips"])
app.include_router(path.router, prefix="/path", tags=["path"])


@app.get("/")
async def root():
    return {"message": "GTFS-JP Wayfinder API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
