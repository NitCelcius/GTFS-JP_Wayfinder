from fastapi.testclient import TestClient

from src.gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_path_search_and_travels(monkeypatch):
    monkeypatch.setattr(
        "src.gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda a, b, s=None: ["A", "B", "C"],
    )

    monkeypatch.setattr(
        "src.gtfs_jp_wayfinder.services.wayfinder_adapter.get_travels_from_path",
        lambda path, s=None: [
            {
                "trip_id": "t-1",
                "fare": 120,
                "arrival_time": "09:00:00",
                "departure_time": "09:05:00",
                "from_stop_id": "sA",
                "to_stop_id": "sB",
            }
        ],
    )

    resp = client.get("/path/search?from_stop=X&to_stop=Y")
    assert resp.status_code == 200
    assert resp.json() == {"path": ["A", "B", "C"]}

    resp2 = client.get("/path/travels?from_stop=X&to_stop=Y")
    assert resp2.status_code == 200
    body = resp2.json()
    assert "travels" in body and isinstance(body["travels"], list)
    assert body["travels"][0]["trip_id"] == "t-1"
