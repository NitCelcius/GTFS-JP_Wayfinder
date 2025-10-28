"""Tests for /path/timed_search edge cases."""

import numpy as np
from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.database import TravelOnce
from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_timed_search_no_buses_available(monkeypatch):
    """Test that timed_search returns empty array when no buses are available."""
    # Mock get_shortest_path to return a valid path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda from_id, to_id, service_id=None: ["1021_01", "1021_02", "1021_03"],
    )

    # Mock get_default_date
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2021-01-01",
    )

    # Mock get_timed_travels_from_path to return empty list (no buses available)
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_timed_travels_from_path",
        lambda path, service_id, begin_time, change_time=None: [],
    )

    # Request with late time (23:00:00) when no buses run
    resp = client.get(
        "/path/timed_search?from_stop=1021_01&to_stop=1021_03&begin_time=230000"
    )

    # Should return 200 OK with empty travels array
    assert resp.status_code == 200
    body = resp.json()
    assert "travels" in body
    assert body["travels"] == []


def test_timed_search_with_valid_buses(monkeypatch):
    """Test that timed_search returns travels when buses are available."""
    # Mock get_shortest_path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda from_id, to_id, service_id=None: ["1021_01", "1021_03"],
    )

    # Mock get_default_date
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2021-01-01",
    )

    # Mock get_timed_travels_from_path to return a travel
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_timed_travels_from_path",
        lambda path, service_id, begin_time, change_time=None: [
            TravelOnce(
                trip_id="trip_001",
                departure_time=np.datetime64("2021-01-01T08:00:00"),
                arrival_time=np.datetime64("2021-01-01T08:30:00"),
                from_stop_id="1021_01",
                to_stop_id="1021_03",
                fare=200,
            ),
        ],
    )

    resp = client.get(
        "/path/timed_search?from_stop=1021_01&to_stop=1021_03&begin_time=080000"
    )

    assert resp.status_code == 200
    body = resp.json()
    assert "travels" in body
    assert len(body["travels"]) == 1
    assert body["travels"][0]["trip_id"] == "trip_001"


def test_timed_search_missing_begin_time(monkeypatch):
    """Test that timed_search returns 400 when begin_time is not provided."""
    # Mock get_shortest_path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda from_id, to_id, service_id=None: ["1021_01", "1021_03"],
    )

    resp = client.get("/path/timed_search?from_stop=1021_01&to_stop=1021_03")

    # Should return 400 Bad Request
    assert resp.status_code == 400
    assert "begin_time parameter is required" in resp.json()["detail"]


def test_timed_search_invalid_stop(monkeypatch):
    """Test that timed_search returns 400 when a stop doesn't exist."""
    import networkx as nx

    # Mock get_shortest_path to raise NodeNotFound error
    def mock_get_shortest_path(from_id, to_id, service_id=None):
        raise nx.NodeNotFound(f"Node {from_id} not found")

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        mock_get_shortest_path,
    )

    # Mock get_default_date
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2021-01-01",
    )

    resp = client.get(
        "/path/timed_search?from_stop=INVALID_STOP&to_stop=1021_03&begin_time=080000"
    )

    # Should return 400 Bad Request
    assert resp.status_code == 400
    assert "not found" in resp.json()["detail"].lower()


def test_timed_search_various_time_formats(monkeypatch):
    """Test that timed_search handles different time formats correctly."""
    # Mock get_shortest_path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda from_id, to_id, service_id=None: ["1021_01", "1021_03"],
    )

    # Mock get_default_date
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2021-01-01",
    )

    # Mock get_timed_travels_from_path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_timed_travels_from_path",
        lambda path, service_id, begin_time, change_time=None: [],
    )

    # Test HHMMSS format
    resp = client.get(
        "/path/timed_search?from_stop=1021_01&to_stop=1021_03&begin_time=230000"
    )
    assert resp.status_code == 200

    # Test HH:MM:SS format
    resp = client.get(
        "/path/timed_search?from_stop=1021_01&to_stop=1021_03&begin_time=23:00:00"
    )
    assert resp.status_code == 200
