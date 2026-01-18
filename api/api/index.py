"""Vercel serverless function entry point.

This module provides the ASGI handler for Vercel's Python runtime.
It imports the FastAPI app and exposes it as the handler.

The app uses pre-built graph data generated during build time,
enabling fast cold starts in serverless environments.
"""

from gtfs_jp_wayfinder.main import app

# Vercel expects an 'app' or 'handler' export for ASGI
handler = app
