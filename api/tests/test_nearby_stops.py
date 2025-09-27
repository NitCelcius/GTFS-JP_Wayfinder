"""Test the nearby stops endpoint functionality."""

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_nearby_stops_endpoint():
    """Test the nearby stops endpoint with mock data."""
    # TODO: test with mock data for wayfinder
    # Test coordinates near 中央公園 (Central Park)
    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113&limit=5")

    # Should return a 200 response (wayfinder will be initialized when test starts)
    assert response.status_code == 200

    data = response.json()
    assert "stops" in data
    assert isinstance(data["stops"], list)
    # Should return at most 5 stops
    assert len(data["stops"]) <= 5

    if len(data["stops"]) > 0:
        stop = data["stops"][0]
        assert "stop_id" in stop
        assert "stop_name" in stop
        assert "distance_km" in stop
        assert "lat" in stop
        assert "lon" in stop


def test_nearby_stops_parameter_validation():
    """Test parameter validation for the nearby stops endpoint."""
    # Test invalid latitude
    response = client.get("/stops/nearby?lat=91&lon=140&limit=5")
    assert response.status_code == 422

    # Test invalid longitude
    response = client.get("/stops/nearby?lat=39&lon=181&limit=5")
    assert response.status_code == 422

    # Test missing required parameters
    response = client.get("/stops/nearby?limit=5")
    assert response.status_code == 422


def test_nearby_stops_limit_enforcement(monkeypatch):
    """Test that limit enforcement works."""
    # Set a very high limit to test max enforcement
    monkeypatch.setenv("API_NEARBY_STOPS_MAX_LIMIT", "5")

    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113&limit=10")
    # Should return 400 because limit exceeds max (initialization will be done when test starts)
    assert response.status_code == 400
    assert "limit too large" in response.json().get("detail", "")
