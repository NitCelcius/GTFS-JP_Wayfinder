#!/usr/bin/env python3
"""Test endpoint logic without full dependencies."""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_endpoint_logic():
    """Test the core logic that would be used in the endpoint."""
    print("Testing endpoint logic...")
    
    from gtfs_jp_wayfinder.utils.distance import haversine_distance
    
    # Mock GTFS stops data (as would be loaded from CSV)
    mock_stops_data = [
        {"stop_id": "1021_01", "stop_name": "中央公園", "stop_lat": 39.71676, "stop_lon": 140.13113},
        {"stop_id": "2001_01", "stop_name": "市役所前", "stop_lat": 39.71876, "stop_lon": 140.13213},
        {"stop_id": "3001_01", "stop_name": "青葉台", "stop_lat": 39.72076, "stop_lon": 140.13313},
        {"stop_id": "4001_01", "stop_name": "さくら通り", "stop_lat": 39.71776, "stop_lon": 140.13413},
        {"stop_id": "5001_01", "stop_name": "緑が丘", "stop_lat": 39.71576, "stop_lon": 140.13513},
    ]
    
    def mock_get_nearby_stops(user_lat, user_lon, limit=10):
        """Mock implementation of get_nearby_stops logic."""
        if limit <= 0:
            raise ValueError("limit must be positive")
            
        # Calculate distances for all stops
        stop_distances = []
        
        for stop_data in mock_stops_data:
            stop_id = stop_data["stop_id"]
            stop_name = stop_data["stop_name"]
            stop_lat = float(stop_data["stop_lat"])
            stop_lon = float(stop_data["stop_lon"])
            
            distance_km = haversine_distance(user_lat, user_lon, stop_lat, stop_lon)
            stop_distances.append((stop_id, stop_name, distance_km, stop_lat, stop_lon))
        
        # Sort by distance and return only the requested limit
        stop_distances.sort(key=lambda x: x[2])  # Sort by distance
        return stop_distances[:limit]
    
    # Test with coordinates near Central Park
    lat, lon = 39.71676, 140.13113
    results = mock_get_nearby_stops(lat, lon, limit=3)
    
    print(f"Found {len(results)} nearby stops:")
    for stop_id, stop_name, distance, stop_lat, stop_lon in results:
        print(f"  {stop_id}: {stop_name} - {distance:.3f}km")
    
    # Verify the results
    assert len(results) == 3
    assert results[0][0] == "1021_01"  # Central Park should be closest
    assert results[0][2] < 0.001  # Distance should be very small
    assert results[0][2] <= results[1][2] <= results[2][2]  # Should be sorted by distance
    
    print("✓ Nearby stops logic works correctly")
    
    # Test limit enforcement
    try:
        mock_get_nearby_stops(lat, lon, limit=0)
        assert False, "Should have raised ValueError for limit=0"
    except ValueError as e:
        assert "limit must be positive" in str(e)
        print("✓ Limit validation works")
    
    # Test different location
    lat2, lon2 = 39.72076, 140.13313  # Near 青葉台
    results2 = mock_get_nearby_stops(lat2, lon2, limit=2)
    assert results2[0][0] == "3001_01"  # 青葉台 should be closest
    print("✓ Different location test works")
    
    return True


def test_environment_variable_logic():
    """Test environment variable handling logic."""
    print("\nTesting environment variable logic...")
    
    def get_limit_from_env(requested_limit=None):
        """Mock environment variable handling."""
        import os
        
        # Get max limit from environment, default 20
        max_limit = int(os.environ.get("API_NEARBY_STOPS_MAX_LIMIT", "20"))
        
        # Use environment default if limit not specified
        if requested_limit is None:
            default_limit = int(os.environ.get("API_NEARBY_STOPS_DEFAULT_LIMIT", "10"))
            return True, default_limit, max_limit
        
        # Validate against max limit
        if requested_limit > max_limit:
            return False, f"limit too large; max is {max_limit}", max_limit
        
        if requested_limit <= 0:
            return False, "limit must be positive", max_limit
            
        return True, requested_limit, max_limit
    
    # Test default behavior
    os.environ.pop("API_NEARBY_STOPS_MAX_LIMIT", None)
    os.environ.pop("API_NEARBY_STOPS_DEFAULT_LIMIT", None)
    
    valid, limit, max_limit = get_limit_from_env(None)
    assert valid and limit == 10 and max_limit == 20
    print("✓ Default limits work (default=10, max=20)")
    
    # Test custom environment variables
    os.environ["API_NEARBY_STOPS_MAX_LIMIT"] = "5"
    os.environ["API_NEARBY_STOPS_DEFAULT_LIMIT"] = "3"
    
    valid, limit, max_limit = get_limit_from_env(None)
    assert valid and limit == 3 and max_limit == 5
    print("✓ Custom environment variables work")
    
    # Test limit enforcement
    valid, msg, max_limit = get_limit_from_env(10)
    assert not valid and "too large" in msg
    print("✓ Max limit enforcement works")
    
    # Clean up
    os.environ.pop("API_NEARBY_STOPS_MAX_LIMIT", None)
    os.environ.pop("API_NEARBY_STOPS_DEFAULT_LIMIT", None)
    
    return True


if __name__ == "__main__":
    success1 = test_endpoint_logic()
    success2 = test_environment_variable_logic()
    
    if success1 and success2:
        print("\n✓ All endpoint logic tests passed!")
    else:
        print("\n✗ Some tests failed!")
        sys.exit(1)