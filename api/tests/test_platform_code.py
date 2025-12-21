"""Tests for platform_code field in stop API responses."""


class TestPlatformCode:
    """Test cases for platform_code functionality."""

    def test_get_stop_with_platform_code(self, monkeypatch, client):
        """Test that platform_code is returned when available."""

        # patch adapter functions
        def fake_get_stop_names(stop_id: str):
            if stop_id == "1022_02":
                return ["秋田駅西口"]
            return ["Unknown"]

        def fake_get_platform_code(stop_id: str):
            if stop_id == "1022_02":
                return "2"
            return None

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
            fake_get_stop_names,
        )
        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
            fake_get_platform_code,
        )

        resp = client.get("/stops/1022_02")
        assert resp.status_code == 200
        data = resp.json()
        assert data["stop_names"] == ["秋田駅西口"]
        assert data["platform_code"] == "2"
        assert isinstance(data["platform_code"], str)
        assert data["location"] is None

    def test_get_stop_without_platform_code(self, monkeypatch, client):
        """Test that platform_code is null when not available."""

        # patch adapter functions
        def fake_get_stop_names(stop_id: str):
            if stop_id == "1002_01":
                return ["勝平交番前"]
            return ["Unknown"]

        def fake_get_platform_code(stop_id: str):
            return None

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
            fake_get_stop_names,
        )
        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
            fake_get_platform_code,
        )

        resp = client.get("/stops/1002_01")
        assert resp.status_code == 200
        data = resp.json()
        assert data["stop_names"] == ["勝平交番前"]
        assert data["platform_code"] is None
        assert data["location"] is None

    def test_get_stop_with_platform_code_and_location(self, monkeypatch, client):
        """Test that both platform_code and location are returned when requested."""

        # patch adapter functions
        def fake_get_stop_names(stop_id: str):
            return ["秋田駅西口"]

        def fake_get_platform_code(stop_id: str):
            return "5"

        def fake_get_stop_lat_lon(stop_id: str):
            return [39.7170, 140.1284]

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
            fake_get_stop_names,
        )
        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
            fake_get_platform_code,
        )
        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_lat_lon",
            fake_get_stop_lat_lon,
        )

        resp = client.get("/stops/1022_05?_fields=location")
        assert resp.status_code == 200
        data = resp.json()
        assert data["stop_names"] == ["秋田駅西口"]
        assert data["platform_code"] == "5"
        assert isinstance(data["platform_code"], str)
        assert data["location"] is not None
        assert data["location"]["lat"] == 39.7170
        assert data["location"]["lon"] == 140.1284

    def test_multiple_stops_with_different_platform_codes(self, monkeypatch, client):
        """Test multiple stops with different platform codes."""
        platform_codes = {
            "1022_02": "2",
            "1022_03": "3",
            "1022_05": "5",
            "1022_09": "9",
            "1002_01": None,
        }

        stop_names = {
            "1022_02": ["秋田駅西口"],
            "1022_03": ["秋田駅西口"],
            "1022_05": ["秋田駅西口"],
            "1022_09": ["秋田駅西口"],
            "1002_01": ["勝平交番前"],
        }

        def fake_get_stop_names(stop_id: str):
            return stop_names.get(stop_id, ["Unknown"])

        def fake_get_platform_code(stop_id: str):
            return platform_codes.get(stop_id)

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
            fake_get_stop_names,
        )
        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
            fake_get_platform_code,
        )

        # Test each stop
        for stop_id, expected_platform_code in platform_codes.items():
            resp = client.get(f"/stops/{stop_id}")
            assert resp.status_code == 200
            data = resp.json()
            assert data["platform_code"] == expected_platform_code
            if expected_platform_code is not None:
                assert isinstance(data["platform_code"], str)

    def test_platform_code_is_string(self, monkeypatch, client):
        """Test that platform_code is always a string, not a float."""

        def fake_get_stop_names(stop_id: str):
            return ["テスト駅"]

        def fake_get_platform_code(stop_id: str):
            return "7"

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
            fake_get_stop_names,
        )
        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
            fake_get_platform_code,
        )

        resp = client.get("/stops/test_stop")
        assert resp.status_code == 200
        data = resp.json()
        assert data["platform_code"] == "7"
        assert isinstance(data["platform_code"], str)
