import datetime

import pandas as pd


def test_get_journey_list_and_dataframe(monkeypatch, client):
    """Test the /trips/journey endpoint returns journey data."""
    df = pd.DataFrame(
        [
            {
                "trip_id": "t2",
                "stop_id": "S2",
                "fare": 130,
                "departure_time": datetime.datetime(
                    year=1980,
                    month=1,
                    day=1,
                    hour=10,
                    minute=0,
                    second=0,
                ),
                "arrival_time": datetime.datetime(
                    year=1980,
                    month=1,
                    day=1,
                    hour=10,
                    minute=30,
                    second=0,
                ),
            },
        ],
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
        lambda trip_id, from_stop: df,
        raising=False,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2025-01-20",
    )

    resp = client.get("/trips/journey?trip_id=t2&from_stop_id=S2")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert body[0]["trip_id"] == "t2"
    # Check that datetime fields use the default date
    assert body[0]["arrival_datetime"].startswith("2025-01-20")


def test_journey_with_reference_date_parameter(monkeypatch, client):
    """Test the /trips/journey endpoint uses reference_date parameter when provided."""
    df = pd.DataFrame(
        [
            {
                "trip_id": "trip1",
                "stop_id": "stop1",
                "fare": 200,
                "departure_time": datetime.datetime(
                    year=1980,
                    month=1,
                    day=1,
                    hour=14,
                    minute=30,
                    second=0,
                ),
                "arrival_time": datetime.datetime(
                    year=1980,
                    month=1,
                    day=1,
                    hour=14,
                    minute=45,
                    second=0,
                ),
            },
        ],
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
        lambda trip_id, from_stop: df,
        raising=False,
    )
    # Note: get_default_date should NOT be called when reference_date is provided
    # but we mock it anyway to ensure the test works correctly
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2025-01-01",  # Different date to ensure parameter overrides
    )

    # Use explicit reference_date parameter
    resp = client.get(
        "/trips/journey?trip_id=trip1&from_stop_id=stop1&reference_date=2025-03-15"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) == 1
    # The datetime fields should use the provided reference_date, not the default
    assert body[0]["arrival_datetime"].startswith("2025-03-15")
    assert body[0]["departure_datetime"].startswith("2025-03-15")


def test_journey_invalid_reference_date_format(monkeypatch, client):
    """Test that invalid reference_date format returns 422 error."""
    df = pd.DataFrame(
        [
            {
                "trip_id": "trip1",
                "stop_id": "stop1",
                "fare": 100,
                "departure_time": datetime.datetime(1980, 1, 1, 10, 0),
                "arrival_time": datetime.datetime(1980, 1, 1, 10, 30),
            },
        ],
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
        lambda trip_id, from_stop: df,
        raising=False,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2025-01-20",
    )

    # Invalid date format should be rejected by validation
    resp = client.get(
        "/trips/journey?trip_id=trip1&from_stop_id=stop1&reference_date=2025/03/15"
    )
    assert resp.status_code == 422  # Validation error
