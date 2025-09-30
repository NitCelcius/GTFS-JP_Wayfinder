import datetime

import pandas as pd
from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_get_journey_list_and_dataframe(monkeypatch):
    df = pd.DataFrame(
        [
            {
                "trip_id": "t2",
                "stop_id": "S2",
                "fare": 130,
                "departure_time": datetime.datetime(
                    year=1980, month=1, day=1, hour=10, minute=0, second=0,
                ),
                "arrival_time": datetime.datetime(
                    year=1980, month=1, day=1, hour=10, minute=30, second=0,
                ),
            },
        ],
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
        lambda trip_id, from_stop: df,
        raising=False,
    )

    resp2 = client.get("/trips/journey?trip_id=t2&from_stop_id=S2")
    assert resp2.status_code == 200
    body2 = resp2.json()
    assert isinstance(body2, list)
    assert body2[0]["trip_id"] == "t2"
