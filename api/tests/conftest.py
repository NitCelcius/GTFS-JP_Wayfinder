"""Pytest configuration and fixtures for all tests."""

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app


@pytest.fixture(scope="class")
def client():
    """Create a TestClient with initialized wayfinder."""
    # Initialize wayfinder synchronously for the TestClient
    api_root = Path(__file__).parent.parent
    data_dir = api_root / "data" / "gtfs-akita-chuo-kotsu"

    if not data_dir.exists():
        pytest.skip(
            f"GTFS data directory not found at {data_dir}. Skipping tests that require real data.",
        )

    # Initialize wayfinder synchronously - the services.wayfinder module
    # Make sure to add trailing slash as expected by database.py
    from gtfs_jp_wayfinder.services import wayfinder

    wayfinder.initialize(str(data_dir) + "/")

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup environment variables for testing."""
    # Set test environment variables
    os.environ.setdefault("API_NEARBY_STOPS_MAX_LIMIT", "20")
    os.environ.setdefault("API_BATCH_MAX_TRIP_IDS", "10")

    yield

    # Cleanup if needed (though environment variables will be reset after test process ends)
