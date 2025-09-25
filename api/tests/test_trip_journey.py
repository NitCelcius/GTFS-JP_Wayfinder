from fastapi.testclient import TestClient

from src.gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_get_journey_list_and_dataframe(monkeypatch):
    # Case 1: adapter returns list of dicts
    monkeypatch.setattr(
        "src.gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
        lambda trip_id, from_stop: [
            {
                "trip_id": trip_id,
                "stop_id": "S1",
                "fare": 120,
                "departure_time": "09:00:00",
                "arrival_time": "09:30:00",
            }
        ],
        raising=False,
    )

    resp = client.get("/trips/journey?trip_id=t1&from_stop_id=S1")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert body[0]["trip_id"] == "t1"

    # Case 2: adapter returns DataFrame-like with to_dict
    class FakeDF:
        def to_dict(self, _):
            return [
                {
                    "trip_id": "t2",
                    "stop_id": "S2",
                    "fare": 130,
                    "departure_time": "10:00:00",
                    "arrival_time": "10:30:00",
                }
            ]

    monkeypatch.setattr(
        "src.gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
        lambda trip_id, from_stop: FakeDF(),
        raising=False,
    )

    resp2 = client.get("/trips/journey?trip_id=t2&from_stop_id=S2")
    assert resp2.status_code == 200
    body2 = resp2.json()
    assert isinstance(body2, list)
    assert body2[0]["trip_id"] == "t2"
