import os

import pytest

from src.gtfs_jp_wayfinder.services import wayfinder_adapter


@pytest.fixture(scope="session", autouse=True)
def scope_session():
    """Synchronous session fixture that initializes the wayfinder service.

    Using a synchronous fixture avoids requiring the pytest-asyncio plugin.
    We call asyncio.run(...) to execute the adapter's async initialize function.
    """
    print("Setup wayfinder")
    data_dir = os.getenv("TEST_GTFS_DATA_DIR", "./data/gtfs-akita-chuo-kotsu/")
    # Run the async initializer in a fresh event loop so tests don't need pytest-asyncio
    import asyncio as _asyncio

    _asyncio.run(wayfinder_adapter.initialize(data_dir))
    yield
    print("Teardown wayfinder")
