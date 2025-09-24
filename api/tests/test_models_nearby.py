#!/usr/bin/env python3
"""Test the nearby stops models and response formatting."""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_pydantic_models():
    """Test the Pydantic models work correctly."""
    print("Testing Pydantic models...")
    
    from gtfs_jp_wayfinder.models import NearbyStop, NearbyStopsResponse
    
    # Test NearbyStop model
    stop = NearbyStop(
        stop_id="1021_01",
        stop_name="中央公園",
        distance_km=0.25,
        lat=39.71676,
        lon=140.13113
    )
    
    assert stop.stop_id == "1021_01"
    assert stop.distance_km == 0.25
    print(f"✓ NearbyStop model: {stop.stop_name} at {stop.distance_km}km")
    
    # Test NearbyStopsResponse model
    stops_list = [
        NearbyStop(
            stop_id="1021_01",
            stop_name="中央公園",
            distance_km=0.0,
            lat=39.71676,
            lon=140.13113
        ),
        NearbyStop(
            stop_id="2001_01",
            stop_name="市役所前",
            distance_km=0.238,
            lat=39.71876,
            lon=140.13213
        )
    ]
    
    response = NearbyStopsResponse(stops=stops_list)
    assert len(response.stops) == 2
    assert response.stops[0].distance_km == 0.0
    assert response.stops[1].distance_km == 0.238
    
    print("✓ NearbyStopsResponse model created successfully")
    
    # Test JSON serialization
    json_data = response.model_dump()
    assert "stops" in json_data
    assert len(json_data["stops"]) == 2
    print("✓ Model serialization works")
    
    return True


def test_response_formatting():
    """Test response formatting logic."""
    print("\nTesting response formatting...")
    
    from gtfs_jp_wayfinder.models import NearbyStop, NearbyStopsResponse
    
    # Simulate data from database method
    mock_db_results = [
        ("1021_01", "中央公園", 0.0, 39.71676, 140.13113),
        ("2001_01", "市役所前", 0.238472, 39.71876, 140.13213),
        ("4001_01", "さくら通り", 0.280193, 39.71776, 140.13413),
    ]
    
    # Format as would be done in the endpoint
    stops = []
    for stop_id, stop_name, distance, stop_lat, stop_lon in mock_db_results:
        stops.append(
            NearbyStop(
                stop_id=stop_id,
                stop_name=stop_name,
                distance_km=round(distance, 3),  # Round to 3 decimal places
                lat=stop_lat,
                lon=stop_lon,
            )
        )
    
    response = NearbyStopsResponse(stops=stops)
    
    # Verify distances are properly rounded
    assert response.stops[0].distance_km == 0.0
    assert response.stops[1].distance_km == 0.238
    assert response.stops[2].distance_km == 0.280
    
    print("✓ Response formatting with rounding works correctly")
    
    # Test JSON output
    json_output = response.model_dump()
    print("Sample JSON output:")
    import json
    print(json.dumps(json_output, indent=2, ensure_ascii=False))
    
    return True


if __name__ == "__main__":
    success1 = test_pydantic_models()
    success2 = test_response_formatting()
    
    if success1 and success2:
        print("\n✓ All model tests passed!")
    else:
        print("\n✗ Some tests failed!")
        sys.exit(1)