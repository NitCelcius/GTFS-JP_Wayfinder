import json
from pathlib import Path

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_upcoming_hardcoded(monkeypatch, client):
    fixture_path = Path(__file__).parent / "fixtures" / "upcoming_1021_01.json"
    expected = json.loads(fixture_path.read_text(encoding="utf-8"))

    trips = [b["trip_id"] for b in expected["buses"]]

    # patch adapter functions to return the trips and their times from `expected`
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop_id, service_id=None: trips,
    )

    time_map = {
        b["trip_id"]: {
            "trip_id": b["trip_id"],
            "arrival_time": b["arrival_time"],
            "departure_time": b["departure_time"],
        }
        for b in expected["buses"]
    }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip_id, stop_id: time_map[trip_id],
    )

    # Mock the new batch function to return the batch time data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            trip_id: time_map[trip_id] for trip_id in trip_ids if trip_id in time_map
        },
    )

    resp = client.get("/stops/1021_01/upcoming")
    assert resp.status_code == 200

    # Strict verification with environment-aware expectations
    response_data = resp.json()

    # The response count depends on environment variable API_BATCH_MAX_TRIP_IDS
    actual_count = len(response_data["buses"])
    assert actual_count > 0, "Should have at least one bus"
    assert actual_count <= 10, "Should not exceed the configured limit of 10"

    # Verify exact structure and content for the buses we do get
    assert response_data["stop_id"] == expected["stop_id"]

    # Verify each bus exactly matches the expected data (first N buses from fixture)
    expected_buses = expected["buses"][:actual_count]
    assert len(response_data["buses"]) == len(expected_buses), (
        f"Expected {len(expected_buses)} buses, got {actual_count}"
    )

    for i, (actual_bus, expected_bus) in enumerate(
        zip(response_data["buses"], expected_buses, strict=True),
    ):
        assert actual_bus["trip_id"] == expected_bus["trip_id"], (
            f"Bus {i}: trip_id mismatch - got '{actual_bus['trip_id']}', expected '{expected_bus['trip_id']}'"
        )
        assert actual_bus["arrival_time"] == expected_bus["arrival_time"], (
            f"Bus {i}: arrival_time mismatch"
        )
        assert actual_bus["departure_time"] == expected_bus["departure_time"], (
            f"Bus {i}: departure_time mismatch"
        )
        assert actual_bus["route_name"] == expected_bus["route_name"], (
            f"Bus {i}: route_name mismatch"
        )
        assert (
            actual_bus["destination_display_name"]
            == expected_bus["destination_display_name"]
        ), f"Bus {i}: destination_display_name mismatch"
        assert (
            actual_bus["destination_stop_id"] == expected_bus["destination_stop_id"]
        ), f"Bus {i}: destination_stop_id mismatch"
        assert actual_bus["stops"] == expected_bus["stops"], f"Bus {i}: stops mismatch"

        # Verify no extra fields
        assert set(actual_bus.keys()) == set(expected_bus.keys()), (
            f"Bus {i}: field set mismatch"
        )

    # Verify no extra top-level fields
    expected_top_level = {"stop_id", "buses"}
    assert set(response_data.keys()) == expected_top_level, (
        "Top-level field set mismatch"
    )
