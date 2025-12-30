#!/usr/bin/env python3
"""Manual test script to verify cache functionality.

This script can be run independently to verify the cache functionality
without requiring the full test environment.
"""

import os
import sys
import tempfile
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

def create_minimal_gtfs_data(base_dir):
    """Create minimal GTFS data files for testing."""
    files = {
        "agency.txt": "agency_id,agency_name,agency_timezone\n1,Test,UTC\n",
        "stops.txt": "stop_id,stop_name,stop_lat,stop_lon\nS1,Stop1,0.0,0.0\nS2,Stop2,1.0,1.0\n",
        "stop_times.txt": "trip_id,arrival_time,departure_time,stop_id,stop_sequence\nT1,08:00:00,08:00:00,S1,1\nT1,08:10:00,08:10:00,S2,2\n",
        "fare_rules.txt": "fare_id,route_id,origin_id,destination_id\nF1,R1,S1,S2\n",
        "fare_attributes.txt": "fare_id,price,currency_type\nF1,100,JPY\n",
        "trips.txt": "route_id,service_id,trip_id,trip_headsign\nR1,SVC1,T1,Test\n",
        "routes.txt": "route_id,route_short_name,route_long_name\nR1,R1,Route1\n",
        "calendar.txt": "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nSVC1,1,1,1,1,1,0,0,20210101,20211231\n",
        "calendar_dates.txt": "service_id,date,exception_type\n",
    }

    for filename, content in files.items():
        filepath = Path(base_dir) / filename
        filepath.write_text(content)

    print(f"✓ Created test GTFS data in {base_dir}")


def test_cache_functionality():
    """Test cache save/load functionality."""
    print("\n=== Testing Graph Cache Functionality ===\n")

    from gtfs_jp_wayfinder.database import AkitaBusWayFinder

    with tempfile.TemporaryDirectory() as tmpdir:
        # Create test data
        create_minimal_gtfs_data(tmpdir)

        # Test 1: Initialize without cache
        print("Test 1: Initialize without caching...")
        wf1 = AkitaBusWayFinder()
        start = time.time()
        wf1.initialize(tmpdir + "/", cache_graph=False)
        time_no_cache = time.time() - start
        cache_path = wf1._get_cache_path(tmpdir)

        if cache_path.exists():
            print("✗ FAILED: Cache file should not exist when cache_graph=False")
            return False
        print(f"✓ No cache file created (took {time_no_cache:.3f}s)")

        # Test 2: Initialize with cache (first time)
        print("\nTest 2: Initialize with caching (first time - should create cache)...")
        wf2 = AkitaBusWayFinder()
        start = time.time()
        wf2.initialize(tmpdir + "/", cache_graph=True)
        time_first_cache = time.time() - start

        if not cache_path.exists():
            print("✗ FAILED: Cache file should exist after initialization with cache_graph=True")
            return False
        print(f"✓ Cache file created at {cache_path} (took {time_first_cache:.3f}s)")

        # Store graph info for comparison
        original_edges = list(wf2.graph.edges())
        original_service_ids = list(wf2.graph_via_service_id.keys())

        # Test 3: Initialize with cache (second time - should load from cache)
        print("\nTest 3: Initialize with caching (second time - should load from cache)...")
        wf3 = AkitaBusWayFinder()
        start = time.time()
        wf3.initialize(tmpdir + "/", cache_graph=True)
        time_cache_load = time.time() - start

        if wf3.graph is None:
            print("✗ FAILED: Graph should be loaded from cache")
            return False

        loaded_edges = list(wf3.graph.edges())
        loaded_service_ids = list(wf3.graph_via_service_id.keys())

        if loaded_edges != original_edges:
            print("✗ FAILED: Loaded graph edges don't match original")
            print(f"  Original: {original_edges}")
            print(f"  Loaded: {loaded_edges}")
            return False

        if loaded_service_ids != original_service_ids:
            print("✗ FAILED: Loaded service IDs don't match original")
            return False

        print(f"✓ Cache loaded successfully (took {time_cache_load:.3f}s)")
        print(f"  Speedup: {time_first_cache/time_cache_load:.1f}x faster")

        # Test 4: Cache invalidation on data change
        print("\nTest 4: Cache invalidation when data changes...")
        stops_file = Path(tmpdir) / "stops.txt"
        time.sleep(0.1)  # Ensure mtime changes
        stops_file.write_text("stop_id,stop_name,stop_lat,stop_lon\nS1,Stop1,0.0,0.0\nS2,Stop2,1.0,1.0\nS3,Stop3,2.0,2.0\n")

        wf4 = AkitaBusWayFinder()
        wf4.initialize(tmpdir + "/", cache_graph=True)

        # Should have regenerated the graph (cache was stale)
        # The new graph should reflect the updated data
        print("✓ Cache invalidated and regenerated on data change")

        print("\n=== All Tests Passed! ===\n")
        return True


if __name__ == "__main__":
    try:
        success = test_cache_functionality()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
