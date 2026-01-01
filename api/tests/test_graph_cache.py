"""Tests for graph caching functionality."""

from pathlib import Path
from unittest.mock import patch

import networkx as nx
import pytest

from gtfs_jp_wayfinder.database import AkitaBusWayFinder


@pytest.fixture
def gtfs_data_dir():
    """Get path to existing GTFS data or skip test if not available."""
    api_root = Path(__file__).parent.parent
    data_dir = api_root / "data" / "gtfs-akita-chuo-kotsu"

    if not data_dir.exists():
        pytest.skip(
            f"GTFS data directory not found at {data_dir}. Skipping cache tests."
        )

    return str(data_dir) + "/"


class TestGraphCache:
    """Test class for graph caching functionality."""

    def test_cache_path_generation(self, gtfs_data_dir):
        """Test that cache path is correctly generated."""
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(gtfs_data_dir)
        expected_path = Path(gtfs_data_dir) / ".graph_cache.pkl"
        assert cache_path == expected_path

    def test_get_data_hash(self, gtfs_data_dir):
        """Test that data hash is correctly computed."""
        wf = AkitaBusWayFinder()
        hash1 = wf._get_data_hash(gtfs_data_dir)

        # Hash should be consistent on repeated calls
        hash2 = wf._get_data_hash(gtfs_data_dir)
        assert hash1 == hash2
        assert isinstance(hash1, str)
        assert len(hash1) == 64  # SHA-256 produces 64 hex characters

    def test_cache_save_and_load(self, gtfs_data_dir):
        """Test that graph cache can be saved and loaded."""
        # Clean up any existing cache first
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(gtfs_data_dir)
        if cache_path.exists():
            cache_path.unlink()

        # Create mock graph data
        wf.graph = nx.DiGraph()
        wf.graph.add_edge("S1", "S2")
        wf.graph_via_service_id = {"SVC1": nx.DiGraph()}
        wf.graph_via_service_id["SVC1"].add_edge("S1", "S2")
        wf.date_to_service_id = {"20210101": ["SVC1"]}

        # Save cache
        wf._save_graph_cache(gtfs_data_dir)

        # Verify cache file exists
        assert cache_path.exists()

        # Load cache in a new instance
        wf2 = AkitaBusWayFinder()
        loaded = wf2._load_graph_cache(gtfs_data_dir)

        assert loaded is True
        assert wf2.graph is not None
        assert wf2.graph.has_edge("S1", "S2")
        assert "SVC1" in wf2.graph_via_service_id
        assert wf2.date_to_service_id == {"20210101": ["SVC1"]}

        # Clean up
        if cache_path.exists():
            cache_path.unlink()

    def test_no_cache_file_returns_false(self, gtfs_data_dir):
        """Test that loading returns False when no cache file exists."""
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(gtfs_data_dir)

        # Ensure no cache exists
        if cache_path.exists():
            cache_path.unlink()

        loaded = wf._load_graph_cache(gtfs_data_dir)
        assert loaded is False

    def test_initialize_with_cache_disabled(self, gtfs_data_dir):
        """Test initialization without caching (default behavior)."""
        # Clean up any existing cache first
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(gtfs_data_dir)
        if cache_path.exists():
            cache_path.unlink()

        wf.initialize(gtfs_data_dir, use_cache_graph=False)

        # Verify graph was generated
        assert wf.graph is not None
        assert wf.date_to_service_id is not None

        # Verify cache file was not created
        assert not cache_path.exists()

    def test_initialize_with_cache_enabled_no_existing_cache(self, gtfs_data_dir):
        """Test initialization with caching enabled and no existing cache."""
        # Clean up any existing cache first
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(gtfs_data_dir)
        if cache_path.exists():
            cache_path.unlink()

        wf.initialize(gtfs_data_dir, use_cache_graph=True)

        # Verify graph was generated
        assert wf.graph is not None
        assert wf.date_to_service_id is not None

        # Verify cache file was created
        assert cache_path.exists()

        # Clean up
        if cache_path.exists():
            cache_path.unlink()

    def test_initialize_with_cache_enabled_existing_valid_cache(self, gtfs_data_dir):
        """Test initialization with caching enabled and valid existing cache."""
        # Clean up any existing cache first
        cache_path = Path(gtfs_data_dir) / ".graph_cache.pkl"
        if cache_path.exists():
            cache_path.unlink()

        # First initialization to create cache
        wf1 = AkitaBusWayFinder()
        wf1.initialize(gtfs_data_dir, use_cache_graph=True)

        # Store the generated graph for comparison
        original_graph_edges = list(wf1.graph.edges())

        # Second initialization should load from cache
        wf2 = AkitaBusWayFinder()

        # Mock generate_graph and generate_calendar to verify they're not called
        with (
            patch.object(wf2, "generate_graph") as mock_gen_graph,
            patch.object(wf2, "generate_calendar") as mock_gen_calendar,
        ):
            wf2.initialize(gtfs_data_dir, use_cache_graph=True)

            # Verify graph/calendar generation methods were not called
            mock_gen_graph.assert_not_called()
            mock_gen_calendar.assert_not_called()

        # Verify the loaded graph matches original
        assert wf2.graph is not None
        assert list(wf2.graph.edges()) == original_graph_edges

        # Clean up
        if cache_path.exists():
            cache_path.unlink()

    def test_cache_corruption_fallback(self, gtfs_data_dir):
        """Test that corrupted cache is handled gracefully."""
        wf = AkitaBusWayFinder()
        cache_path = wf._get_cache_path(gtfs_data_dir)

        # Create a corrupted cache file
        with open(cache_path, "wb") as f:
            f.write(b"corrupted data")

        # Loading should return False
        loaded = wf._load_graph_cache(gtfs_data_dir)
        assert loaded is False

        # Clean up
        if cache_path.exists():
            cache_path.unlink()
