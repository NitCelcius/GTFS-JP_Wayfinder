#!/usr/bin/env python3
"""
Demonstration of the nearby bus stops endpoint implementation.
This script shows how the endpoint works with sample data.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api', 'src'))

def main():
    """Demonstrate the nearby stops functionality."""
    print("🚌 GTFS-JP Wayfinder: Nearby Bus Stops Endpoint Demo")
    print("=" * 60)
    
    from gtfs_jp_wayfinder.utils.distance import haversine_distance
    
    # Sample bus stops from the test data
    bus_stops = [
        {"stop_id": "1021_01", "stop_name": "中央公園", "lat": 39.71676, "lon": 140.13113},
        {"stop_id": "2001_01", "stop_name": "市役所前", "lat": 39.71876, "lon": 140.13213},
        {"stop_id": "3001_01", "stop_name": "青葉台", "lat": 39.72076, "lon": 140.13313},
        {"stop_id": "4001_01", "stop_name": "さくら通り", "lat": 39.71776, "lon": 140.13413},
        {"stop_id": "5001_01", "stop_name": "緑が丘", "lat": 39.71576, "lon": 140.13513},
        {"stop_id": "6001_01", "stop_name": "東駅", "lat": 39.71676, "lon": 140.13613},
        {"stop_id": "7001_01", "stop_name": "西口", "lat": 39.71476, "lon": 140.13013},
        {"stop_id": "8001_01", "stop_name": "南町", "lat": 39.71376, "lon": 140.13213},
        {"stop_id": "9001_01", "stop_name": "北高前", "lat": 39.71976, "lon": 140.13413},
        {"stop_id": "10001_01", "stop_name": "大学病院", "lat": 39.72176, "lon": 140.13613},
    ]
    
    print("\n📍 Sample Location: Near Central Park (中央公園)")
    user_lat, user_lon = 39.71676, 140.13113
    print(f"   Coordinates: {user_lat}, {user_lon}")
    
    # Calculate distances and sort
    nearby_stops = []
    for stop in bus_stops:
        distance = haversine_distance(user_lat, user_lon, stop["lat"], stop["lon"])
        nearby_stops.append({
            **stop,
            "distance_km": round(distance, 3)
        })
    
    nearby_stops.sort(key=lambda x: x["distance_km"])
    
    print("\n🔍 Nearby Bus Stops (sorted by distance):")
    print("-" * 60)
    for i, stop in enumerate(nearby_stops[:5], 1):
        print(f"{i:2d}. {stop['stop_name']} ({stop['stop_id']})")
        print(f"    Distance: {stop['distance_km']:.3f} km")
        print(f"    Location: {stop['lat']}, {stop['lon']}")
        print()
    
    print("📋 API Endpoint Usage Examples:")
    print("-" * 60)
    base_url = "http://localhost:8002"
    
    print(f"GET {base_url}/stops/nearby?lat={user_lat}&lon={user_lon}&limit=5")
    print("Response:")
    print("{")
    print('  "stops": [')
    for i, stop in enumerate(nearby_stops[:3]):
        comma = "," if i < 2 else ""
        print(f'    {{')
        print(f'      "stop_id": "{stop["stop_id"]}",')
        print(f'      "stop_name": "{stop["stop_name"]}",')
        print(f'      "distance_km": {stop["distance_km"]},')
        print(f'      "lat": {stop["lat"]},')
        print(f'      "lon": {stop["lon"]}')
        print(f'    }}{comma}')
    print('  ]')
    print('}')
    
    print("\n⚙️  Configuration Options:")
    print("-" * 60)
    print("Environment Variables:")
    print("• API_NEARBY_STOPS_DEFAULT_LIMIT=10 (default when no limit specified)")
    print("• API_NEARBY_STOPS_MAX_LIMIT=20 (maximum allowed limit)")
    
    print("\n✅ Features Implemented:")
    print("-" * 60)
    print("• Haversine distance calculation for accurate geodesic distances")
    print("• Parameter validation (lat: -90 to 90, lon: -180 to 180)")
    print("• Configurable result limits via environment variables") 
    print("• Results sorted by distance (nearest first)")
    print("• Comprehensive error handling and HTTP status codes")
    print("• Complete test suite covering all functionality")
    
    print("\n🚀 Ready to use!")

if __name__ == "__main__":
    main()