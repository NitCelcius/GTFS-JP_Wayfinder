"""
Vercel entry point for the GTFS-JP Wayfinder API.

This module provides a Vercel-compatible entry point for the FastAPI application.
The API expects GTFS data to be available via environment variables or external storage.
"""

import logging

# Configure logging for Vercel
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Import the main app
    from src.gtfs_jp_wayfinder.main import app

    # Vercel expects the app to be available as a callable
    handler = app

    logger.info("GTFS-JP Wayfinder API loaded successfully for Vercel")

except Exception as e:
    logger.error(f"Failed to load main app: {e}")
    # Quit with error instead of fallback
    raise e
