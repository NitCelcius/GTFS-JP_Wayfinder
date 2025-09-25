# Vercel runs this file

import src.gtfs_jp_wayfinder.main  # pyright: ignore[reportUnusedImport]  # noqa: F401 -- ensure dependencies are loaded
from src.gtfs_jp_wayfinder.main import (
    app,  # pyright: ignore[reportUnknownVariableType, reportUnusedImport]  # noqa: F401 -- Vercel runs with this
)
