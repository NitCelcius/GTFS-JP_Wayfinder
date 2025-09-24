"""Test distance calculation utilities."""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from gtfs_jp_wayfinder.utils.distance import haversine_distance


def test_haversine_distance_same_point():
    """Test that distance between same point is 0."""
    distance = haversine_distance(39.71676, 140.13113, 39.71676, 140.13113)
    assert abs(distance) < 0.001  # Should be very close to 0


def test_haversine_distance_known_values():
    """Test distance calculation with known values."""
    # Distance between Tokyo and Osaka (approximate coordinates)
    tokyo_lat, tokyo_lon = 35.6762, 139.6503
    osaka_lat, osaka_lon = 34.6937, 135.5023
    
    distance = haversine_distance(tokyo_lat, tokyo_lon, osaka_lat, osaka_lon)
    # Tokyo to Osaka is approximately 400-450 km
    assert 350 < distance < 500


def test_haversine_distance_short_distance():
    """Test short distance calculation."""
    # Two points very close to each other
    lat1, lon1 = 39.71676, 140.13113
    lat2, lon2 = 39.71876, 140.13213  # About 200m apart
    
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    # Should be less than 1 km
    assert distance < 1.0
    assert distance > 0


if __name__ == "__main__":
    test_haversine_distance_same_point()
    test_haversine_distance_known_values()
    test_haversine_distance_short_distance()
    print("All distance calculation tests passed!")