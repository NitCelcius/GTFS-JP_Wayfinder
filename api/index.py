"""
Vercel entry point for the GTFS-JP Wayfinder API.

This module provides a Vercel-compatible entry point for the FastAPI application.
The API expects GTFS data to be available via environment variables or external storage.
"""

import os
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
    # Create a fallback minimal API
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    fallback_app = FastAPI(
        title="GTFS-JP Wayfinder API (Fallback)",
        description="Minimal fallback API when main app cannot be loaded"
    )
    
    fallback_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify exact origins
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @fallback_app.get("/")
    async def fallback_root():
        return {
            "message": "GTFS-JP Wayfinder API (Fallback Mode)",
            "status": "limited_functionality",
            "error": "Main application could not be initialized"
        }
    
    @fallback_app.get("/health")
    async def health_check():
        return {"status": "ok", "mode": "fallback"}
    
    handler = fallback_app
    logger.info("Fallback API loaded")