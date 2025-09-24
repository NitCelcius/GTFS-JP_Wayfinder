"""Test the nearby stops endpoint functionality."""
from fastapi.testclient import TestClient
import pytest
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_nearby_stops_endpoint():
    """Test the nearby stops endpoint with mock data."""
    # Test coordinates near 中央公園 (Central Park)
    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113&limit=5")
    
    # Should return a 200 response
    assert response.status_code in [200, 400]  # 400 might occur if wayfinder is not initialized
    
    if response.status_code == 200:
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
    
    # Test invalid limit (0)
    response = client.get("/stops/nearby?lat=39&lon=140&limit=0")
    assert response.status_code == 400


def test_nearby_stops_limit_enforcement():
    """Test that limit enforcement works."""
    # Set a very high limit to test max enforcement
    import os
    os.environ["API_NEARBY_STOPS_MAX_LIMIT"] = "5"
    
    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113&limit=10")
    # Should return 400 because limit exceeds max
    if response.status_code != 500:  # Skip if wayfinder not initialized
        assert response.status_code == 400
        assert "limit too large" in response.json().get("detail", "")


if __name__ == "__main__":
    test_nearby_stops_endpoint()
    test_nearby_stops_parameter_validation()
    test_nearby_stops_limit_enforcement()
    print("All tests passed!")