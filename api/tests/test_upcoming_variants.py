def test_upcoming_variants(monkeypatch, client):
    stop_id = "S100"

    # Mock service_id lookup to return a valid service_id
    # (otherwise the endpoint returns empty for dates outside GTFS calendar)
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_service_ids_for_date",
        lambda date_str: ["平日"],
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: None,
    )
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200
    response_json = resp.json()
    assert response_json["stop_id"] == stop_id
    assert response_json["buses"] == []
    assert "reference_date" in response_json

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["tA", "tB"],
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip, stop: {"arrival_time": "07:00:00", "departure_time": "07:05:00"},
    )

    # Mock the new batch function
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            trip_id: {
                "trip_id": trip_id,
                "arrival_time": "07:00:00",
                "departure_time": "07:05:00",
            }
            for trip_id in trip_ids
        },
    )

    resp2 = client.get(f"/stops/{stop_id}/upcoming")
    assert resp2.status_code == 200
    body = resp2.json()
    assert body["stop_id"] == stop_id
    assert len(body["buses"]) == 2
    assert body["buses"][0]["trip_id"] == "tA"
