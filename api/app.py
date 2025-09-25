# Vercel runs this file

from src.gtfs_jp_wayfinder.main import (
    app,  # pyright: ignore[reportUnknownVariableType, reportUnusedImport]  # noqa: F401 -- Vercel runs with this
)
