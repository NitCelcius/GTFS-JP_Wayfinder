"""Tests for platform switching (のりば切替) API endpoint."""


class TestPlatformSwitching:
    """Test cases for GET /stops/{stop_id}/platforms endpoint."""

    def test_get_platforms_with_multiple_stops(self, monkeypatch, client):
        """Test that endpoint returns multiple related platform stops."""

        def fake_get_related_platforms(stop_id: str):
            if stop_id == "1022_02":
                return [
                    {
                        "stop_id": "1022_02",
                        "stop_name": "秋田駅西口",
                        "platform_code": "2",
                        "stop_lat": 39.71729,
                        "stop_lon": 140.12843,
                    },
                    {
                        "stop_id": "1022_03",
                        "stop_name": "秋田駅西口",
                        "platform_code": "3",
                        "stop_lat": 39.71719,
                        "stop_lon": 140.12843,
                    },
                    {
                        "stop_id": "1022_04",
                        "stop_name": "秋田駅西口",
                        "platform_code": "4",
                        "stop_lat": 39.71709,
                        "stop_lon": 140.12843,
                    },
                ]
            raise KeyError(f"stop_id not found: {stop_id}")

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_related_platforms",
            fake_get_related_platforms,
        )

        resp = client.get("/stops/1022_02/platforms")
        assert resp.status_code == 200
        data = resp.json()
        assert "stops" in data
        assert len(data["stops"]) == 3

        # Verify first stop
        assert data["stops"][0]["stop_id"] == "1022_02"
        assert data["stops"][0]["stop_name"] == "秋田駅西口"
        assert data["stops"][0]["platform_code"] == "2"
        assert data["stops"][0]["lat"] == 39.71729
        assert data["stops"][0]["lon"] == 140.12843

        # Verify second stop
        assert data["stops"][1]["stop_id"] == "1022_03"
        assert data["stops"][1]["platform_code"] == "3"

    def test_get_platforms_with_single_stop(self, monkeypatch, client):
        """Test endpoint returns single stop when there are no other platforms."""

        def fake_get_related_platforms(stop_id: str):
            if stop_id == "1021_01":
                return [
                    {
                        "stop_id": "1021_01",
                        "stop_name": "中央公園",
                        "platform_code": None,
                        "stop_lat": 39.71676,
                        "stop_lon": 140.13113,
                    },
                ]
            raise KeyError(f"stop_id not found: {stop_id}")

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_related_platforms",
            fake_get_related_platforms,
        )

        resp = client.get("/stops/1021_01/platforms")
        assert resp.status_code == 200
        data = resp.json()
        assert "stops" in data
        assert len(data["stops"]) == 1
        assert data["stops"][0]["stop_id"] == "1021_01"
        assert data["stops"][0]["platform_code"] is None

    def test_get_platforms_stop_not_found(self, monkeypatch, client):
        """Test endpoint returns 400 when stop_id is not found."""

        def fake_get_related_platforms(stop_id: str):
            raise KeyError(f"stop_id not found: {stop_id}")

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_related_platforms",
            fake_get_related_platforms,
        )

        resp = client.get("/stops/nonexistent_stop/platforms")
        assert resp.status_code == 400
        data = resp.json()
        assert "stop_id not found" in data["detail"]

    def test_get_platforms_mixed_platform_codes(self, monkeypatch, client):
        """Test endpoint handles stops with and without platform codes."""

        def fake_get_related_platforms(stop_id: str):
            if stop_id == "1002_01":
                return [
                    {
                        "stop_id": "1002_01",
                        "stop_name": "勝平交番前",
                        "platform_code": None,
                        "stop_lat": 39.6966,
                        "stop_lon": 140.0849,
                    },
                    {
                        "stop_id": "1002_02",
                        "stop_name": "勝平交番前",
                        "platform_code": None,
                        "stop_lat": 39.6963,
                        "stop_lon": 140.0857,
                    },
                ]
            raise KeyError(f"stop_id not found: {stop_id}")

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_related_platforms",
            fake_get_related_platforms,
        )

        resp = client.get("/stops/1002_01/platforms")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["stops"]) == 2
        # Both should have None platform_code
        assert all(stop["platform_code"] is None for stop in data["stops"])

    def test_get_platforms_includes_self(self, monkeypatch, client):
        """Test that the response includes the requested stop_id itself."""

        def fake_get_related_platforms(stop_id: str):
            if stop_id == "1022_05":
                return [
                    {
                        "stop_id": "1022_02",
                        "stop_name": "秋田駅西口",
                        "platform_code": "2",
                        "stop_lat": 39.71729,
                        "stop_lon": 140.12843,
                    },
                    {
                        "stop_id": "1022_05",
                        "stop_name": "秋田駅西口",
                        "platform_code": "5",
                        "stop_lat": 39.71702,
                        "stop_lon": 140.12847,
                    },
                ]
            raise KeyError(f"stop_id not found: {stop_id}")

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_related_platforms",
            fake_get_related_platforms,
        )

        resp = client.get("/stops/1022_05/platforms")
        assert resp.status_code == 200
        data = resp.json()
        stop_ids = [stop["stop_id"] for stop in data["stops"]]
        assert "1022_05" in stop_ids  # The requested stop should be included
        assert "1022_02" in stop_ids  # Other platform should also be included
