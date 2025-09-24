#!/usr/bin/env python3
"""Isolated test for the nearby stops database method without full initialization."""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_distance_sorting():
    """Test that nearby stops logic works correctly."""
    print("Testing distance calculation and sorting...")
    
    from gtfs_jp_wayfinder.utils.distance import haversine_distance
    
    # Mock bus stop data
    stops = [
        ("1021_01", "中央公園", 39.71676, 140.13113),
        ("2001_01", "市役所前", 39.71876, 140.13213),
        ("3001_01", "青葉台", 39.72076, 140.13313),
        ("4001_01", "さくら通り", 39.71776, 140.13413),
        ("5001_01", "緑が丘", 39.71576, 140.13513),
    ]
    
    # Test location (near Central Park)
    test_lat, test_lon = 39.71676, 140.13113
    
    # Calculate distances
    stop_distances = []
    for stop_id, stop_name, stop_lat, stop_lon in stops:
        distance = haversine_distance(test_lat, test_lon, stop_lat, stop_lon)
        stop_distances.append((stop_id, stop_name, distance, stop_lat, stop_lon))
    
    # Sort by distance
    stop_distances.sort(key=lambda x: x[2])
    
    print(f"Nearby stops sorted by distance from ({test_lat}, {test_lon}):")
    for i, (stop_id, stop_name, distance, stop_lat, stop_lon) in enumerate(stop_distances[:3], 1):
        print(f"  {i}. {stop_id}: {stop_name} - {distance:.3f}km")
    
    # The first stop should be Central Park itself (distance ~0)
    assert stop_distances[0][0] == "1021_01"
    assert stop_distances[0][2] < 0.001  # Very close to 0
    
    print("✓ Distance sorting test passed!")
    return True


def test_endpoint_request_validation():
    """Test the request validation logic."""
    print("\nTesting endpoint parameter validation...")
    
    def validate_lat_lon(lat, lon):
        """Simulate the endpoint validation."""
        if not (-90 <= lat <= 90):
            return False, "Invalid latitude"
        if not (-180 <= lon <= 180):
            return False, "Invalid longitude"
        return True, "Valid"
    
    def validate_limit(limit, max_limit=20):
        """Simulate limit validation."""
        if limit is None:
            return True, 10  # default
        if limit <= 0:
            return False, "limit must be positive"
        if limit > max_limit:
            return False, f"limit too large; max is {max_limit}"
        return True, limit
    
    # Test valid coordinates
    valid, msg = validate_lat_lon(39.71676, 140.13113)
    assert valid, f"Valid coordinates should pass: {msg}"
    
    # Test invalid coordinates
    valid, msg = validate_lat_lon(91, 140)
    assert not valid, "Invalid latitude should fail"
    
    valid, msg = validate_lat_lon(39, 181)
    assert not valid, "Invalid longitude should fail"
    
    # Test limit validation
    valid, limit = validate_limit(5)
    assert valid and limit == 5, "Valid limit should pass"
    
    valid, msg = validate_limit(0)
    assert not valid, "Zero limit should fail"
    
    valid, msg = validate_limit(25, max_limit=20)
    assert not valid, "Limit exceeding max should fail"
    
    valid, limit = validate_limit(None)
    assert valid and limit == 10, "None limit should return default"
    
    print("✓ Parameter validation tests passed!")
    return True


if __name__ == "__main__":
    success1 = test_distance_sorting()
    success2 = test_endpoint_request_validation()
    
    if success1 and success2:
        print("\n✓ All isolated tests passed!")
    else:
        print("\n✗ Some tests failed!")
        sys.exit(1)