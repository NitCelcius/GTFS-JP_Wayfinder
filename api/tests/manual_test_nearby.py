#!/usr/bin/env python3
"""Manual test script to verify the nearby stops functionality."""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_database_method():
    """Test the database method directly."""
    print("Testing AkitaBusWayFinder.get_nearby_stops method...")
    
    try:
        from gtfs_jp_wayfinder.database import AkitaBusWayFinder
        
        wf = AkitaBusWayFinder()
        wf.initialize("../data/gtfs-akita-chuo-kotsu/")
        
        # Test with coordinates near Central Park
        lat, lon = 39.71676, 140.13113
        result = wf.get_nearby_stops(lat, lon, limit=5)
        
        print(f"Found {len(result)} nearby stops:")
        for stop_id, stop_name, distance, stop_lat, stop_lon in result:
            print(f"  {stop_id}: {stop_name} - {distance:.3f}km @ ({stop_lat}, {stop_lon})")
            
        return True
        
    except Exception as e:
        print(f"Error testing database method: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_service_adapter():
    """Test the service adapter method."""
    print("\nTesting wayfinder service adapter...")
    
    try:
        from gtfs_jp_wayfinder.services import wayfinder
        
        # Initialize the wayfinder
        wayfinder.initialize("../data/gtfs-akita-chuo-kotsu/")
        
        # Test with coordinates near Central Park
        lat, lon = 39.71676, 140.13113
        result = wayfinder.get_nearby_stops(lat, lon, limit=5)
        
        print(f"Found {len(result)} nearby stops via adapter:")
        for stop_id, stop_name, distance, stop_lat, stop_lon in result:
            print(f"  {stop_id}: {stop_name} - {distance:.3f}km @ ({stop_lat}, {stop_lon})")
            
        return True
        
    except Exception as e:
        print(f"Error testing service adapter: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success1 = test_database_method()
    success2 = test_service_adapter()
    
    if success1 and success2:
        print("\n✓ All manual tests passed!")
    else:
        print("\n✗ Some tests failed!")
        sys.exit(1)