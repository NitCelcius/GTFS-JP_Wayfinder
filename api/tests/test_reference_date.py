"""Tests for API responses with reference_date field."""

import datetime
from zoneinfo import ZoneInfo

from gtfs_jp_wayfinder.database import TravelOnce


def test_timed_search_includes_reference_date(monkeypatch, client):
    """Test that /path/timed_search includes reference_date in response."""
    # Mock shortest path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda a, b, s=None: ["S1", "S2"],
    )

    # Mock timed travels
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_timed_travels_from_path",
        lambda path, s=None, begin_time=None, change_time=None: [
            TravelOnce(
                trip_id="t1",
                departure_time="08:00:00",
                arrival_time="08:30:00",
                from_stop_id="S1",
                to_stop_id="S2",
                fare=150,
            ),
        ],
    )

    # Test with ISO datetime
    resp = client.get(
        "/path/timed_search?from_stop=S1&to_stop=S2&begin_time=2025-10-28T08:00:00",
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "reference_date" in body
    assert body["reference_date"] == "2025-10-28"
    assert "travels" in body
    assert len(body["travels"]) > 0


def test_timed_search_with_hh_mm_ss_includes_reference_date(monkeypatch, client):
    """Test that /path/timed_search with HH:MM:SS format includes today's date."""
    # Mock shortest path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda a, b, s=None: ["S1", "S2"],
    )

    # Mock timed travels
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_timed_travels_from_path",
        lambda path, s=None, begin_time=None, change_time=None: [
            TravelOnce(
                trip_id="t1",
                departure_time="08:00:00",
                arrival_time="08:30:00",
                from_stop_id="S1",
                to_stop_id="S2",
                fare=150,
            ),
        ],
    )

    # Test with HH:MM:SS format
    resp = client.get("/path/timed_search?from_stop=S1&to_stop=S2&begin_time=08:00:00")
    assert resp.status_code == 200
    body = resp.json()
    assert "reference_date" in body
    # Should be today's date
    assert (
        body["reference_date"]
        == datetime.datetime.now(ZoneInfo("Asia/Tokyo")).date().isoformat()
    )
    assert "travels" in body


def test_upcoming_trips_includes_reference_date(monkeypatch, client):
    """Test that /stops/{stop_id}/upcoming includes reference_date in response."""
    trips = ["trip1", "trip2"]

    # Mock adapter functions
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop_id, service_id=None: trips,
    )

    time_map = {
        "trip1": {
            "trip_id": "trip1",
            "arrival_time": "08:00:00",
            "departure_time": "08:00:00",
        },
        "trip2": {
            "trip_id": "trip2",
            "arrival_time": "09:00:00",
            "departure_time": "09:00:00",
        },
    }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            trip_id: time_map[trip_id] for trip_id in trip_ids if trip_id in time_map
        },
    )

    resp = client.get("/stops/test_stop/upcoming")
    assert resp.status_code == 200
    body = resp.json()

    assert "reference_date" in body
    # Should be today's date for upcoming trips
    assert (
        body["reference_date"]
        == datetime.datetime.now(ZoneInfo("Asia/Tokyo")).date().isoformat()
    )
    assert "stop_id" in body
    assert "buses" in body
    assert len(body["buses"]) == 2
