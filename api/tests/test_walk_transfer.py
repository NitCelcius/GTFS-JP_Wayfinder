"""
Tests for walk transfer functionality in database.py.

Walk transfers enable routing through platform changes at the same station.
They are represented by bidirectional edges between stops with identical names.
"""

import pytest

from gtfs_jp_wayfinder.database import WALK_TRANSFER_TRIP_ID, AkitaBusWayFinder


@pytest.fixture
def wayfinder_instance(monkeypatch):
    """
    Fixture that provides a minimal test instance of AkitaBusWayFinder.
    Uses monkeypatch to avoid loading real GTFS data.
    """
    wf = AkitaBusWayFinder()
    # Minimal initialization - just set up the structures we need for testing
    wf.df_stops = None  # Will be set per test
    wf._walk_transfer_pairs = set()
    return wf


def test_generate_walk_transfer_edges_with_multiple_platforms(
    wayfinder_instance, monkeypatch
):
    """
    Test that walk transfer edges are correctly generated for stops with identical names.
    """
    import pandas as pd

    # Create mock stops dataframe with same-name stops (different platforms)
    mock_stops = pd.DataFrame(
        {
            "stop_id": ["akita-eki_01", "akita-eki_02", "akita-eki_03", "chuo-koen_01"],
            "stop_name": [
                "秋田駅東口",
                "秋田駅東口",
                "秋田駅東口",
                "中央公園",
            ],  # 3 stops with same name, 1 unique
        }
    )

    monkeypatch.setattr(wayfinder_instance, "df_stops", mock_stops)

    # Generate walk transfer edges
    edges = wayfinder_instance._generate_walk_transfer_edges()

    # Should create bidirectional edges between all 3 秋田駅東口 stops
    # Expected: 3 stops -> 3*2/2 * 2 (bidirectional) = 6 edges
    # (01->02, 02->01, 01->03, 03->01, 02->03, 03->02)
    assert len(edges) == 6

    # Verify specific edges exist
    expected_edges = [
        ("akita-eki_01", "akita-eki_02"),
        ("akita-eki_02", "akita-eki_01"),
        ("akita-eki_01", "akita-eki_03"),
        ("akita-eki_03", "akita-eki_01"),
        ("akita-eki_02", "akita-eki_03"),
        ("akita-eki_03", "akita-eki_02"),
    ]

    for edge in expected_edges:
        assert edge in edges, f"Expected edge {edge} not found in generated edges"


def test_generate_walk_transfer_edges_with_unique_stops(
    wayfinder_instance, monkeypatch
):
    """
    Test that no walk transfer edges are generated when all stops have unique names.
    """
    import pandas as pd

    # Create mock stops dataframe with all unique names
    mock_stops = pd.DataFrame(
        {
            "stop_id": ["stop_01", "stop_02", "stop_03"],
            "stop_name": ["秋田駅東口", "中央公園", "イオンモール秋田"],
        }
    )

    monkeypatch.setattr(wayfinder_instance, "df_stops", mock_stops)

    # Generate walk transfer edges
    edges = wayfinder_instance._generate_walk_transfer_edges()

    # No edges should be generated for unique stop names
    assert len(edges) == 0


def test_generate_walk_transfer_edges_with_two_platforms(
    wayfinder_instance, monkeypatch
):
    """
    Test walk transfer edge generation for the common case of two platforms.
    """
    import pandas as pd

    # Create mock stops dataframe with exactly 2 stops sharing a name
    mock_stops = pd.DataFrame(
        {
            "stop_id": ["akita-eki_01", "akita-eki_02"],
            "stop_name": ["秋田駅東口", "秋田駅東口"],
        }
    )

    monkeypatch.setattr(wayfinder_instance, "df_stops", mock_stops)

    # Generate walk transfer edges
    edges = wayfinder_instance._generate_walk_transfer_edges()

    # Should create exactly 2 bidirectional edges
    assert len(edges) == 2
    assert ("akita-eki_01", "akita-eki_02") in edges
    assert ("akita-eki_02", "akita-eki_01") in edges


def test_is_walk_transfer_identifies_pairs(wayfinder_instance):
    """
    Test that is_walk_transfer correctly identifies walk transfer pairs.
    """
    # Set up known walk transfer pairs
    wayfinder_instance._walk_transfer_pairs = {
        ("akita-eki_01", "akita-eki_02"),
        ("akita-eki_02", "akita-eki_01"),
    }

    # Should identify known pairs
    assert wayfinder_instance.is_walk_transfer("akita-eki_01", "akita-eki_02") is True
    assert wayfinder_instance.is_walk_transfer("akita-eki_02", "akita-eki_01") is True

    # Should return False for unknown pairs
    assert wayfinder_instance.is_walk_transfer("akita-eki_01", "chuo-koen_01") is False
    assert wayfinder_instance.is_walk_transfer("chuo-koen_01", "ion-mall_01") is False


def test_get_travels_from_path_includes_walk_transfers(wayfinder_instance, monkeypatch):
    """
    Test that get_travels_from_path correctly inserts walk transfer segments.
    """

    # Setup: mock is_walk_transfer to return True for specific pair
    def mock_is_walk_transfer(from_stop, to_stop):
        return from_stop == "akita-eki_01" and to_stop == "akita-eki_02"

    monkeypatch.setattr(wayfinder_instance, "is_walk_transfer", mock_is_walk_transfer)

    # Mock get_trips_from_stops to return empty list (no regular trips)
    monkeypatch.setattr(
        wayfinder_instance, "get_trips_from_stops", lambda *args, **kwargs: []
    )

    # Mock get_fare_from_stops to return a dummy fare
    monkeypatch.setattr(wayfinder_instance, "get_fare_from_stops", lambda *args: 100)

    # Test path with walk transfer
    path = ["chuo-koen_01", "akita-eki_01", "akita-eki_02", "ion-mall_01"]

    travels = wayfinder_instance.get_travels_from_path(path)

    # Should have 3 travel segments
    assert len(travels) == 3

    # Second segment should be a walk transfer
    walk_transfer = travels[1]
    assert walk_transfer.trip_id == WALK_TRANSFER_TRIP_ID
    assert walk_transfer.fare == 0
    assert walk_transfer.is_walk_transfer is True
    assert walk_transfer.from_stop_id == "akita-eki_01"
    assert walk_transfer.to_stop_id == "akita-eki_02"


def test_get_timed_travels_from_path_includes_walk_transfers(
    wayfinder_instance, monkeypatch
):
    """
    Test that get_timed_travels_from_path correctly handles walk transfers with timing.
    """

    # Setup: mock is_walk_transfer
    def mock_is_walk_transfer(from_stop, to_stop):
        return from_stop == "akita-eki_01" and to_stop == "akita-eki_02"

    monkeypatch.setattr(wayfinder_instance, "is_walk_transfer", mock_is_walk_transfer)

    # Mock get_trips_from_stops to return trip IDs for non-walk-transfer segments
    def mock_get_trips_from_stops(from_stop, to_stop, service_id):
        # Only return trips for regular bus segments (not walk transfers)
        if from_stop == "chuo-koen_01" and to_stop == "akita-eki_01":
            return ["trip_001"]
        if from_stop == "akita-eki_02" and to_stop == "ion-mall_01":
            return ["trip_002"]
        return []

    monkeypatch.setattr(
        wayfinder_instance, "get_trips_from_stops", mock_get_trips_from_stops
    )

    # Mock get_trip_times to return departure and arrival times
    def mock_get_trip_times(from_stop, to_stop, trip_id):
        if trip_id == "trip_001":
            # chuo-koen_01 -> akita-eki_01: depart 10:00, arrive 10:15
            return (
                wayfinder_instance.time_str_to_np_datetime("10:00:00"),
                wayfinder_instance.time_str_to_np_datetime("10:15:00"),
            )
        if trip_id == "trip_002":
            # akita-eki_02 -> ion-mall_01: depart 10:20, arrive 10:45
            return (
                wayfinder_instance.time_str_to_np_datetime("10:20:00"),
                wayfinder_instance.time_str_to_np_datetime("10:45:00"),
            )
        return (None, None)

    monkeypatch.setattr(wayfinder_instance, "get_trip_times", mock_get_trip_times)

    # Mock get_fare_from_stops to return a dummy fare
    monkeypatch.setattr(wayfinder_instance, "get_fare_from_stops", lambda *args: 100)

    # Set default date for time conversions
    wayfinder_instance.default_date = "2021-01-01"

    # Test path with walk transfer
    path = ["chuo-koen_01", "akita-eki_01", "akita-eki_02", "ion-mall_01"]
    begin_time = wayfinder_instance.time_str_to_np_datetime("10:00:00")
    service_id = "weekday"

    travels = wayfinder_instance.get_timed_travels_from_path(
        path, service_id, begin_time
    )

    # Should have at least one walk transfer
    walk_transfers = [t for t in travels if t.is_walk_transfer]
    assert len(walk_transfers) >= 1

    # Walk transfer should maintain same time for departure and arrival
    walk_transfer = walk_transfers[0]
    assert walk_transfer.trip_id == WALK_TRANSFER_TRIP_ID
    assert walk_transfer.fare == 0
    assert walk_transfer.departure_time == walk_transfer.arrival_time
    assert walk_transfer.from_stop_id == "akita-eki_01"
    assert walk_transfer.to_stop_id == "akita-eki_02"


def test_get_same_name_stops_returns_all_connected_stops(wayfinder_instance):
    """
    Test that get_same_name_stops returns all same-name stops including the original.
    """
    # Set up walk transfer pairs
    wayfinder_instance._walk_transfer_pairs = {
        ("akita-eki_01", "akita-eki_02"),
        ("akita-eki_02", "akita-eki_01"),
        ("akita-eki_01", "akita-eki_03"),
        ("akita-eki_03", "akita-eki_01"),
        ("akita-eki_02", "akita-eki_03"),
        ("akita-eki_03", "akita-eki_02"),
    }

    # Should return all same-name stops
    same_name_stops = wayfinder_instance.get_same_name_stops("akita-eki_01")
    assert "akita-eki_01" in same_name_stops  # Original stop
    assert "akita-eki_02" in same_name_stops  # Same-name stop
    assert "akita-eki_03" in same_name_stops  # Same-name stop
    assert len(same_name_stops) == 3


def test_get_same_name_stops_returns_only_original_when_no_transfers(wayfinder_instance):
    """
    Test that get_same_name_stops returns only the original stop when no walk transfers exist.
    """
    wayfinder_instance._walk_transfer_pairs = set()

    same_name_stops = wayfinder_instance.get_same_name_stops("unique_stop")
    assert same_name_stops == ["unique_stop"]


def test_get_trip_journey_uses_same_name_stop_for_fare_calculation(
    wayfinder_instance, monkeypatch
):
    """
    Test that get_trip_journey correctly uses a same-name stop for fare calculation
    when the provided from_stop_id is not directly on the trip.
    """
    import pandas as pd

    # Set up walk transfer pairs: akita-eki_01 and akita-eki_02 are same-name stops
    wayfinder_instance._walk_transfer_pairs = {
        ("akita-eki_01", "akita-eki_02"),
        ("akita-eki_02", "akita-eki_01"),
    }

    # Mock get_stops_from_trip to return stops including akita-eki_01 (but NOT akita-eki_02)
    mock_trip_stops = pd.DataFrame(
        {
            "stop_id": ["akita-eki_01", "chuo-koen_01", "ion-mall_01"],
            "trip_id": ["trip_001", "trip_001", "trip_001"],
            "stop_sequence": [1, 2, 3],
            "arrival_time": ["10:00:00", "10:15:00", "10:30:00"],
            "departure_time": ["10:00:00", "10:15:00", "10:30:00"],
            "stop_headsign": ["", "", ""],
        }
    )
    monkeypatch.setattr(
        wayfinder_instance, "get_stops_from_trip", lambda trip_id: mock_trip_stops
    )

    # Mock get_fare_from_stops to track what origin is used
    fare_calls = []

    def mock_get_fare(from_id, to_id):
        fare_calls.append((from_id, to_id))
        return 200

    monkeypatch.setattr(wayfinder_instance, "get_fare_from_stops", mock_get_fare)

    # Mock get_time_from_trip_and_stop
    def mock_get_time(trip_id, stop_id):
        return {
            "arrival_time": wayfinder_instance.time_str_to_np_datetime("10:00:00"),
            "departure_time": wayfinder_instance.time_str_to_np_datetime("10:00:00"),
        }

    monkeypatch.setattr(
        wayfinder_instance, "get_time_from_trip_and_stop", mock_get_time
    )

    # Set default date for time conversion
    wayfinder_instance.default_date = "2021-01-01"

    # Call get_trip_journey with akita-eki_02 (which is NOT on the trip, but same-name as akita-eki_01)
    result = wayfinder_instance.get_trip_journey("trip_001", "akita-eki_02")

    # Verify the result has entries
    assert len(result) == 3

    # Verify fare for the first stop (akita-eki_01) is 0 because it's the effective origin
    # (walk transfer from akita-eki_02 to akita-eki_01)
    assert result[result["stop_id"] == "akita-eki_01"]["fare"].values[0] == 0

    # Verify fare calculations used akita-eki_01 as the origin (not akita-eki_02)
    for from_id, _to_id in fare_calls:
        assert from_id == "akita-eki_01", f"Expected origin akita-eki_01, got {from_id}"
