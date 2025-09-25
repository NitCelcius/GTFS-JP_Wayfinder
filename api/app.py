"""Lightweight entrypoint used by Vercel.

This module intentionally avoids importing the heavy application package at
module-import time. The original version ran asyncio.run(...) during import,
which forces lifespan/startup code to execute when platforms import the
module (Vercel behavior). Instead we expose an ASGI-compatible proxy `app`
which imports the real FastAPI `app` only when the server actually dispatches
requests or starts the lifespan.

If you want to run the application's lifespan manually (for local testing),
you can run this file as a script: `python api/app.py` which will execute the
startup and shutdown lifecycle using `asgi_lifespan`.
"""

import importlib
from types import ModuleType
from typing import Optional

# Cached reference to the real FastAPI app once imported
_real_app: Optional[object] = None


def _import_real_app():
    """Import and cache the real FastAPI `app` from the package.

    This defers importing the application package (which pulls in pandas,
    networkx, and does heavy I/O inside the lifespan) until the ASGI server
    actually calls the app.
    """
    global _real_app
    if _real_app is not None:
        return _real_app

    mod: ModuleType = importlib.import_module("src.gtfs_jp_wayfinder.main")
    _real_app = getattr(mod, "app")
    return _real_app


class _LazyApp:
    """ASGI app proxy that imports the real app on first use and delegates.

    This object implements the ASGI callable interface so platforms that
    expect a module-level `app` will work without triggering initialization
    at import time.
    """

    async def __call__(self, scope, receive, send):
        real = _import_real_app()
        return await real(scope, receive, send)


# Export the proxy as the module-level ASGI app expected by Vercel/uvicorn.
app = _LazyApp()


def _run_lifespan_for_cli():
    """Run the application's lifespan when executing this file as a script.

    This is useful for local checks and mirrors the previous behavior that
    executed the lifespan on import — but here it only runs when intentionally
    invoked (python api/app.py).
    """
    try:
        # import lazily so environments without this package don't fail on import
        import asyncio
        import asyncio as _asyncio

        from asgi_lifespan import LifespanManager

        real = _import_real_app()

        # initialization of the GTFS dataset can be slow; give a long timeout
        STARTUP_TIMEOUT_SECONDS = int(
            __import__("os").environ.get("API_STARTUP_TIMEOUT", "300")
        )

        async def _main():
            try:
                async with LifespanManager(
                    real, startup_timeout=STARTUP_TIMEOUT_SECONDS
                ):
                    # placeholder — keep the context open briefly
                    await asyncio.sleep(0)
            except _asyncio.TimeoutError:
                print(
                    f"Lifespan startup timed out after {STARTUP_TIMEOUT_SECONDS} seconds. "
                    "If initialization is expected to be slow, increase API_STARTUP_TIMEOUT."
                )

        asyncio.run(_main())
    except ModuleNotFoundError:
        print(
            "asgi_lifespan not installed; install it to run CLI lifespan: pip install asgi_lifespan"
        )


if __name__ == "__main__":
    _run_lifespan_for_cli()
