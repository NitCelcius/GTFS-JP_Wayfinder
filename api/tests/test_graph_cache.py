"""Tests for graph caching functionality."""

import os
import pickle
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import networkx as nx
import pytest

from gtfs_jp_wayfinder.database import AkitaBusWayFinder


@pytest.fixture
def temp_gtfs_dir():
    """Create a temporary directory with mock GTFS files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create mock GTFS files
        gtfs_files = [
            "agency.txt",
            "stops.txt",
            "stop_times.txt",
            "fare_rules.txt",
            "fare_attributes.txt",
            "trips.txt",
            "routes.txt",
            "calendar.txt",
            "calendar_dates.txt",
        ]
        for filename in gtfs_files:
            filepath = Path(tmpdir) / filename
            # Create minimal content for each file
            if filename == "agency.txt":
                filepath.write_text("agency_id,agency_name,agency_timezone\n1,Test,UTC\n")
            elif filename == "stops.txt":
                filepath.write_text(
                    "stop_id,stop_name,stop_lat,stop_lon\nS1,Stop1,0.0,0.0\n"
                )
            elif filename == "stop_times.txt":
                filepath.write_text(
                    "trip_id,arrival_time,departure_time,stop_id,stop_sequence\nT1,08:00:00,08:00:00,S1,1\n"
                )
            elif filename == "fare_rules.txt":
                filepath.write_text(
                    "fare_id,route_id,origin_id,destination_id\nF1,R1,S1,S1\n"
                )
            elif filename == "fare_attributes.txt":
                filepath.write_text("fare_id,price,currency_type\nF1,100,JPY\n")
            elif filename == "trips.txt":
                filepath.write_text(
                    "route_id,service_id,trip_id,trip_headsign\nR1,SVC1,T1,Test\n"
                )
            elif filename == "routes.txt":
                filepath.write_text(
                    "route_id,route_short_name,route_long_name\nR1,R1,Route1\n"
                )
            elif filename == "calendar.txt":
                filepath.write_text(
                    "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\n"
                    "SVC1,1,1,1,1,1,0,0,20210101,20211231\n"
                )
            elif filename == "calendar_dates.txt":
                filepath.write_text("service_id,date,exception_type\n")
        
        yield tmpdir


class TestGraphCache:
    """Test class for graph caching functionality."""

    def test_cache_path_generation(self, temp_gtfs_dir):
        """Test that cache path is correctly generated."""
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(temp_gtfs_dir)
        expected_path = Path(temp_gtfs_dir) / ".graph_cache.pkl"
        assert cache_path == expected_path

    def test_get_data_mtime(self, temp_gtfs_dir):
        """Test that data modification time is correctly retrieved."""
        wf = AkitaBusWayFinder()
        mtime = wf._get_data_mtime(temp_gtfs_dir)
        assert isinstance(mtime, float)
        assert mtime > 0

    def test_cache_save_and_load(self, temp_gtfs_dir):
        """Test that graph cache can be saved and loaded."""
        wf = AkitaBusWayFinder()
        
        # Create mock graph data
        wf.graph = nx.DiGraph()
        wf.graph.add_edge("S1", "S2")
        wf.graph_via_service_id = {"SVC1": nx.DiGraph()}
        wf.graph_via_service_id["SVC1"].add_edge("S1", "S2")
        wf.date_to_service_id = {"20210101": ["SVC1"]}
        
        # Save cache
        wf._save_graph_cache(temp_gtfs_dir)
        
        # Verify cache file exists
        cache_path = wf._get_cache_path(temp_gtfs_dir)
        assert cache_path.exists()
        
        # Load cache in a new instance
        wf2 = AkitaBusWayFinder()
        loaded = wf2._load_graph_cache(temp_gtfs_dir)
        
        assert loaded is True
        assert wf2.graph is not None
        assert wf2.graph.has_edge("S1", "S2")
        assert "SVC1" in wf2.graph_via_service_id
        assert wf2.date_to_service_id == {"20210101": ["SVC1"]}

    def test_cache_invalidation_on_data_change(self, temp_gtfs_dir):
        """Test that cache is invalidated when GTFS data changes."""
        wf = AkitaBusWayFinder()
        
        # Create and save initial cache
        wf.graph = nx.DiGraph()
        wf.graph.add_edge("S1", "S2")
        wf.graph_via_service_id = {}
        wf.date_to_service_id = {}
        wf._save_graph_cache(temp_gtfs_dir)
        
        # Modify a GTFS file to update its mtime
        stops_file = Path(temp_gtfs_dir) / "stops.txt"
        import time
        time.sleep(0.1)  # Ensure mtime changes
        stops_file.write_text(
            "stop_id,stop_name,stop_lat,stop_lon\nS1,Stop1,0.0,0.0\nS2,Stop2,1.0,1.0\n"
        )
        
        # Try to load cache - should fail due to stale data
        wf2 = AkitaBusWayFinder()
        loaded = wf2._load_graph_cache(temp_gtfs_dir)
        
        assert loaded is False

    def test_no_cache_file_returns_false(self, temp_gtfs_dir):
        """Test that loading returns False when no cache file exists."""
        wf = AkitaBusWayFinder()
        loaded = wf._load_graph_cache(temp_gtfs_dir)
        assert loaded is False

    def test_initialize_with_cache_disabled(self, temp_gtfs_dir):
        """Test initialization without caching (default behavior)."""
        wf = AkitaBusWayFinder()
        wf.initialize(temp_gtfs_dir + "/", cache_graph=False)
        
        # Verify graph was generated
        assert wf.graph is not None
        assert wf.date_to_service_id is not None
        
        # Verify cache file was not created
        cache_path = wf._get_cache_path(temp_gtfs_dir)
        assert not cache_path.exists()

    def test_initialize_with_cache_enabled_no_existing_cache(self, temp_gtfs_dir):
        """Test initialization with caching enabled and no existing cache."""
        wf = AkitaBusWayFinder()
        wf.initialize(temp_gtfs_dir + "/", cache_graph=True)
        
        # Verify graph was generated
        assert wf.graph is not None
        assert wf.date_to_service_id is not None
        
        # Verify cache file was created
        cache_path = wf._get_cache_path(temp_gtfs_dir)
        assert cache_path.exists()

    def test_initialize_with_cache_enabled_existing_valid_cache(self, temp_gtfs_dir):
        """Test initialization with caching enabled and valid existing cache."""
        # First initialization to create cache
        wf1 = AkitaBusWayFinder()
        wf1.initialize(temp_gtfs_dir + "/", cache_graph=True)
        
        # Store the generated graph for comparison
        original_graph_edges = list(wf1.graph.edges())
        
        # Second initialization should load from cache
        wf2 = AkitaBusWayFinder()
        
        # Mock generate_graph and generate_calendar to verify they're not called
        with patch.object(wf2, "generate_graph") as mock_gen_graph, \
             patch.object(wf2, "generate_calendar") as mock_gen_calendar:
            
            wf2.initialize(temp_gtfs_dir + "/", cache_graph=True)
            
            # Verify graph/calendar generation methods were not called
            mock_gen_graph.assert_not_called()
            mock_gen_calendar.assert_not_called()
            
        # Verify the loaded graph matches original
        assert wf2.graph is not None
        assert list(wf2.graph.edges()) == original_graph_edges

    def test_cache_corruption_fallback(self, temp_gtfs_dir):
        """Test that corrupted cache is handled gracefully."""
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(temp_gtfs_dir)
        
        # Create a corrupted cache file
        with open(cache_path, "wb") as f:
            f.write(b"corrupted data")
        
        # Loading should return False
        loaded = wf._load_graph_cache(temp_gtfs_dir)
        assert loaded is False
