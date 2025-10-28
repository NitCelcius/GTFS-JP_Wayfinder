"""Tests for database.get_timed_travels_from_path edge cases."""
import numpy as np
import pytest

from gtfs_jp_wayfinder.database import AkitaBusWayFinder, TravelOnce


def test_get_timed_travels_from_path_no_trips_available(monkeypatch):
    """Test that get_timed_travels_from_path returns empty list when no trips are available."""
    # Create a mock wayfinder instance
    wf = AkitaBusWayFinder()
    wf.default_date = "2021-01-01"

    # Mock get_trips_from_stops to return empty list (no trips available)
    monkeypatch.setattr(
        wf, "get_trips_from_stops", lambda from_id, to_id, service_id: []
    )

    # Call with a valid path and time
    path = ["stop1", "stop2"]
    begin_time = np.datetime64("2021-01-01T23:00:00")
    result = wf.get_timed_travels_from_path(path, "service1", begin_time)

    # Should return empty list instead of raising error
    assert result == []


def test_get_timed_travels_from_path_late_time(monkeypatch):
    """Test handling of late departure time when no later trips exist."""
    wf = AkitaBusWayFinder()
    wf.default_date = "2021-01-01"

    # Mock to return trips but all depart before the begin_time
    def mock_get_trips_from_stops(from_id, to_id, service_id):
        return ["trip1", "trip2"]

    def mock_get_trip_times(from_id, to_id, trip_id):
        # All trips depart at 20:00, which is before our begin_time of 23:00
        return (
            np.datetime64("2021-01-01T20:00:00"),
            np.datetime64("2021-01-01T20:30:00"),
        )

    monkeypatch.setattr(wf, "get_trips_from_stops", mock_get_trips_from_stops)
    monkeypatch.setattr(wf, "get_trip_times", mock_get_trip_times)

    path = ["stop1", "stop2"]
    begin_time = np.datetime64("2021-01-01T23:00:00")
    result = wf.get_timed_travels_from_path(path, "service1", begin_time)

    # Should return empty list when no trips depart after begin_time
    assert result == []


def test_get_timed_travels_from_path_none_begin_time():
    """Test that None begin_time raises appropriate error."""
    wf = AkitaBusWayFinder()
    wf.default_date = "2021-01-01"

    path = ["stop1", "stop2"]
    with pytest.raises(ValueError, match="begin_time cannot be None"):
        wf.get_timed_travels_from_path(path, "service1", None)


def test_get_timed_travels_from_path_none_cur_time(monkeypatch):
    """Test handling when cur_time becomes None (e.g., from invalid data)."""
    wf = AkitaBusWayFinder()
    wf.default_date = "2021-01-01"

    # Mock to return trips
    monkeypatch.setattr(
        wf, "get_trips_from_stops", lambda from_id, to_id, service_id: ["trip1"]
    )

    # Mock get_trip_times to return None for arr_time (simulating data corruption)
    def mock_get_trip_times(from_id, to_id, trip_id):
        return (np.datetime64("2021-01-01T08:00:00"), None)

    monkeypatch.setattr(wf, "get_trip_times", mock_get_trip_times)
    monkeypatch.setattr(wf, "get_fare_from_stops", lambda from_id, to_id: 200)

    # Path with 2 stops (1 segment) - arr_time will be None
    path = ["stop1", "stop2"]
    begin_time = np.datetime64("2021-01-01T08:00:00")
    
    # Should raise ValueError when arr_time is None (data integrity issue)
    with pytest.raises(ValueError, match="Arrival time is None"):
        wf.get_timed_travels_from_path(path, "service1", begin_time)


def test_get_timed_travels_from_path_successful(monkeypatch):
    """Test successful case with available trips."""
    wf = AkitaBusWayFinder()
    wf.default_date = "2021-01-01"

    # Mock to return trips
    monkeypatch.setattr(
        wf, "get_trips_from_stops", lambda from_id, to_id, service_id: ["trip1"]
    )

    # Mock get_trip_times to return valid times
    def mock_get_trip_times(from_id, to_id, trip_id):
        return (
            np.datetime64("2021-01-01T08:00:00"),
            np.datetime64("2021-01-01T08:30:00"),
        )

    monkeypatch.setattr(wf, "get_trip_times", mock_get_trip_times)
    monkeypatch.setattr(wf, "get_fare_from_stops", lambda from_id, to_id: 200)

    path = ["stop1", "stop2"]
    begin_time = np.datetime64("2021-01-01T07:00:00")
    result = wf.get_timed_travels_from_path(path, "service1", begin_time)

    # Should return one travel
    assert len(result) == 1
    assert isinstance(result[0], TravelOnce)
    assert result[0].trip_id == "trip1"
    assert result[0].from_stop_id == "stop1"
    assert result[0].to_stop_id == "stop2"
    assert result[0].fare == 200
