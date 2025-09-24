"""Test distance calculation utilities."""

from gtfs_jp_wayfinder.utils.distance import HaversineDistanceCalculator, EuclideanDistanceCalculator


def test_haversine_distance_same_point():
    """Test that distance between same point is 0."""
    calculator = HaversineDistanceCalculator()
    distance = calculator.calculate_distance(39.71676, 140.13113, 39.71676, 140.13113)
    assert abs(distance) < 0.001  # Should be very close to 0


def test_haversine_distance_known_values():
    """Test distance calculation with known values."""
    # Distance between Tokyo and Osaka (approximate coordinates)
    calculator = HaversineDistanceCalculator()
    tokyo_lat, tokyo_lon = 35.6762, 139.6503
    osaka_lat, osaka_lon = 34.6937, 135.5023
    
    distance = calculator.calculate_distance(tokyo_lat, tokyo_lon, osaka_lat, osaka_lon)
    # Tokyo to Osaka is approximately 400-450 km
    # TODO: Verify exact distance value since it's deterministic and doesn't fluctuate at runtime
    assert 350 < distance < 500


def test_haversine_distance_short_distance():
    """Test short distance calculation."""
    calculator = HaversineDistanceCalculator()
    # Two points very close to each other
    lat1, lon1 = 39.71676, 140.13113
    lat2, lon2 = 39.71876, 140.13213  # About 200m apart
    
    distance = calculator.calculate_distance(lat1, lon1, lat2, lon2)
    # Should be less than 1 km
    # TODO: Measure precise distance for exact verification
    assert distance < 1.0
    assert distance > 0


def test_euclidean_distance_approximation():
    """Test that Euclidean distance gives reasonable approximation."""
    haversine_calc = HaversineDistanceCalculator()
    euclidean_calc = EuclideanDistanceCalculator()
    
    lat1, lon1 = 39.71676, 140.13113
    lat2, lon2 = 39.71876, 140.13213
    
    haversine_dist = haversine_calc.calculate_distance(lat1, lon1, lat2, lon2)
    euclidean_dist = euclidean_calc.calculate_distance(lat1, lon1, lat2, lon2)
    
    # Euclidean should be reasonably close for short distances (within 20% difference)
    assert abs(haversine_dist - euclidean_dist) / haversine_dist < 0.2