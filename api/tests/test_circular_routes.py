"""Tests for circular route handling where trips visit the same stop multiple times.

The GTFS dataset contains 50 trips where a stop is visited more than once (circular routes).
These tests verify that the lookup indices and query methods handle this correctly.
"""

import numpy as np
import pytest

from gtfs_jp_wayfinder.database import AkitaBusWayFinder


class TestCircularRouteLookupIndices:
    """Test that _trip_stop_times index correctly stores multiple visits to same stop."""

    @pytest.fixture
    def wayfinder_with_circular_route(self):
        """Create a minimal wayfinder with mock circular route data."""
        import pandas as pd

        wf = AkitaBusWayFinder()
        wf.default_date = "2021-01-01"

        # Create minimal dataframes for a circular route
        # Trip visits stop_B twice: A -> B -> C -> B -> D
        wf.df_stop_times = pd.DataFrame(
            {
                "trip_id": ["trip1", "trip1", "trip1", "trip1", "trip1"],
                "stop_id": ["stop_A", "stop_B", "stop_C", "stop_B", "stop_D"],
                "stop_sequence": [1, 2, 3, 4, 5],
                "arrival_time": [
                    np.datetime64("2021-01-01T08:00:00"),
                    np.datetime64("2021-01-01T08:10:00"),
                    np.datetime64("2021-01-01T08:20:00"),
                    np.datetime64("2021-01-01T08:30:00"),
                    np.datetime64("2021-01-01T08:40:00"),
                ],
                "departure_time": [
                    np.datetime64("2021-01-01T08:00:00"),
                    np.datetime64("2021-01-01T08:10:00"),
                    np.datetime64("2021-01-01T08:20:00"),
                    np.datetime64("2021-01-01T08:30:00"),
                    np.datetime64("2021-01-01T08:40:00"),
                ],
            }
        )

        wf.df_trips = pd.DataFrame(
            {
                "trip_id": ["trip1"],
                "service_id": ["weekday"],
            }
        )

        # Build indices manually (normally done in initialize())
        wf._build_lookup_indices()

        return wf

    def test_index_stores_multiple_visits(self, wayfinder_with_circular_route):
        """Verify that _trip_stop_times stores all visits to the same stop."""
        wf = wayfinder_with_circular_route

        # stop_B is visited twice in trip1 (at sequences 2 and 4)
        key = ("trip1", "stop_B")
        assert key in wf._trip_stop_times
        entries = wf._trip_stop_times[key]

        # Should have 2 entries for the 2 visits
        assert len(entries) == 2

        # Check sequences are correct
        sequences = [entry[2] for entry in entries]  # entry = (arr, dep, seq)
        assert sorted(sequences) == [2, 4]

    def test_index_stores_single_visit(self, wayfinder_with_circular_route):
        """Verify single-visit stops have exactly one entry."""
        wf = wayfinder_with_circular_route

        # stop_A, stop_C, stop_D are visited only once
        for stop_id, expected_seq in [("stop_A", 1), ("stop_C", 3), ("stop_D", 5)]:
            key = ("trip1", stop_id)
            assert key in wf._trip_stop_times
            entries = wf._trip_stop_times[key]
            assert len(entries) == 1
            assert entries[0][2] == expected_seq  # Check sequence


class TestGetTripsFromStopsCircular:
    """Test get_trips_from_stops with circular routes."""

    @pytest.fixture
    def wayfinder_with_circular_route(self):
        """Create wayfinder with circular route: A -> B -> C -> B -> D."""
        import pandas as pd

        wf = AkitaBusWayFinder()
        wf.default_date = "2021-01-01"

        wf.df_stop_times = pd.DataFrame(
            {
                "trip_id": ["trip1", "trip1", "trip1", "trip1", "trip1"],
                "stop_id": ["stop_A", "stop_B", "stop_C", "stop_B", "stop_D"],
                "stop_sequence": [1, 2, 3, 4, 5],
                "arrival_time": [
                    np.datetime64("2021-01-01T08:00:00"),
                    np.datetime64("2021-01-01T08:10:00"),
                    np.datetime64("2021-01-01T08:20:00"),
                    np.datetime64("2021-01-01T08:30:00"),
                    np.datetime64("2021-01-01T08:40:00"),
                ],
                "departure_time": [
                    np.datetime64("2021-01-01T08:00:00"),
                    np.datetime64("2021-01-01T08:10:00"),
                    np.datetime64("2021-01-01T08:20:00"),
                    np.datetime64("2021-01-01T08:30:00"),
                    np.datetime64("2021-01-01T08:40:00"),
                ],
            }
        )

        wf.df_trips = pd.DataFrame(
            {
                "trip_id": ["trip1"],
                "service_id": ["weekday"],
            }
        )

        wf._build_lookup_indices()
        return wf

    def test_single_visit_stops_forward(self, wayfinder_with_circular_route):
        """Trip with single visits to each stop returns correctly."""
        wf = wayfinder_with_circular_route

        # A -> C should find trip1 (A at seq 1, C at seq 3)
        trips = wf.get_trips_from_stops("stop_A", "stop_C")
        assert "trip1" in trips

    def test_circular_route_first_visit_to_later_stop(
        self, wayfinder_with_circular_route
    ):
        """From stop before first B visit to stop after first B visit."""
        wf = wayfinder_with_circular_route

        # A -> B: Should find trip1 (A at 1, B first visit at 2)
        trips = wf.get_trips_from_stops("stop_A", "stop_B")
        assert "trip1" in trips

    def test_circular_route_between_two_visits_of_same_stop(
        self, wayfinder_with_circular_route
    ):
        """From first visit of B to second visit of B."""
        wf = wayfinder_with_circular_route

        # B -> B: First B at seq 2, second B at seq 4
        # This should find trip1 because seq 4 > seq 2
        trips = wf.get_trips_from_stops("stop_B", "stop_B")
        assert "trip1" in trips

    def test_circular_route_second_visit_to_final_stop(
        self, wayfinder_with_circular_route
    ):
        """From second visit of B to the final stop D."""
        wf = wayfinder_with_circular_route

        # B -> D: B has visits at seq 2 and 4, D at seq 5
        # Both B visits are before D, so this should work
        trips = wf.get_trips_from_stops("stop_B", "stop_D")
        assert "trip1" in trips

    def test_reverse_direction_not_found(self, wayfinder_with_circular_route):
        """Reverse direction (later -> earlier) should not find trips."""
        wf = wayfinder_with_circular_route

        # D -> A: D at seq 5, A at seq 1 - wrong order
        trips = wf.get_trips_from_stops("stop_D", "stop_A")
        assert "trip1" not in trips


class TestGetTripTimesCircular:
    """Test get_trip_times with circular routes."""

    @pytest.fixture
    def wayfinder_with_circular_route(self):
        """Create wayfinder with circular route: A -> B -> C -> B -> D."""
        import pandas as pd

        wf = AkitaBusWayFinder()
        wf.default_date = "2021-01-01"

        wf.df_stop_times = pd.DataFrame(
            {
                "trip_id": ["trip1", "trip1", "trip1", "trip1", "trip1"],
                "stop_id": ["stop_A", "stop_B", "stop_C", "stop_B", "stop_D"],
                "stop_sequence": [1, 2, 3, 4, 5],
                "arrival_time": [
                    np.datetime64("2021-01-01T08:00:00"),
                    np.datetime64("2021-01-01T08:10:00"),
                    np.datetime64("2021-01-01T08:20:00"),
                    np.datetime64("2021-01-01T08:30:00"),
                    np.datetime64("2021-01-01T08:40:00"),
                ],
                "departure_time": [
                    np.datetime64("2021-01-01T08:01:00"),
                    np.datetime64("2021-01-01T08:11:00"),
                    np.datetime64("2021-01-01T08:21:00"),
                    np.datetime64("2021-01-01T08:31:00"),
                    np.datetime64("2021-01-01T08:41:00"),
                ],
            }
        )

        wf.df_trips = pd.DataFrame(
            {
                "trip_id": ["trip1"],
                "service_id": ["weekday"],
            }
        )

        wf._build_lookup_indices()
        return wf

    def test_single_visit_returns_correct_times(self, wayfinder_with_circular_route):
        """Single-visit stops return correct departure and arrival times."""
        wf = wayfinder_with_circular_route

        dep, arr = wf.get_trip_times("stop_A", "stop_C", "trip1")
        # A departs at 08:01, C arrives at 08:20
        # numpy datetime64 may format with space instead of 'T'
        assert "08:01:00" in str(dep)
        assert "08:20:00" in str(arr)

    def test_circular_uses_first_valid_sequence(self, wayfinder_with_circular_route):
        """When multiple sequences exist, use first valid (from < to) pair."""
        wf = wayfinder_with_circular_route

        # A -> B: A departs 08:01, B first visit arrives 08:10
        dep, arr = wf.get_trip_times("stop_A", "stop_B", "trip1")
        assert "08:01:00" in str(dep)
        assert "08:10:00" in str(arr)  # First B visit, not second

    def test_circular_same_stop_to_same_stop(self, wayfinder_with_circular_route):
        """B -> B should use first B departure and second B arrival."""
        wf = wayfinder_with_circular_route

        # B first departs 08:11, B second arrives 08:30
        dep, arr = wf.get_trip_times("stop_B", "stop_B", "trip1")
        assert "08:11:00" in str(dep)  # First B departure
        assert "08:30:00" in str(arr)  # Second B arrival

    def test_reverse_sequence_raises_error(self, wayfinder_with_circular_route):
        """Requesting times in reverse order raises ValueError."""
        wf = wayfinder_with_circular_route

        with pytest.raises(ValueError, match="does not stop at"):
            wf.get_trip_times("stop_D", "stop_A", "trip1")


class TestRealDataCircularRoutes:
    """Integration tests using actual GTFS data with circular routes."""

    @pytest.fixture(scope="class")
    def wayfinder_real(self):
        """Initialize wayfinder with real GTFS data."""
        from pathlib import Path

        wf = AkitaBusWayFinder()
        api_root = Path(__file__).parent.parent
        data_dir = api_root / "data" / "gtfs-akita-chuo-kotsu"

        if not data_dir.exists():
            pytest.skip("GTFS data directory not found")

        wf.initialize(str(data_dir) + "/")
        return wf

    def test_real_circular_route_index_has_multiple_entries(self, wayfinder_real):
        """Verify real circular route data has multiple entries in index."""
        wf = wayfinder_real

        # From our data exploration: trip '土日祝_08時00分_系統40001' visits '5061_01' twice
        key = ("土日祝_08時00分_系統40001", "5061_01")
        assert key in wf._trip_stop_times
        entries = wf._trip_stop_times[key]
        assert len(entries) == 2, "Should have 2 entries for stop visited twice"

    def test_real_circular_route_sequences(self, wayfinder_real):
        """Verify sequences are correctly stored for circular route."""
        wf = wayfinder_real

        key = ("土日祝_08時00分_系統40001", "5061_01")
        entries = wf._trip_stop_times[key]
        sequences = sorted([entry[2] for entry in entries])
        # From our data: stop 5061_01 appears at sequences 14 and 15
        assert sequences == [14, 15]

    def test_real_circular_get_trip_times(self, wayfinder_real):
        """Test get_trip_times on real circular route."""
        wf = wayfinder_real

        # Get times from a stop before the circular stop to the circular stop
        # Trip 土日祝_08時00分_系統40001: 1021_03 (seq 1) -> 5061_01 (first visit seq 14)
        dep, arr = wf.get_trip_times("1021_03", "5061_01", "土日祝_08時00分_系統40001")

        # Should get first visit times
        dep_str = wf.np_datetime_truncate_to_str(dep)
        arr_str = wf.np_datetime_truncate_to_str(arr)

        assert dep_str == "08:00:00"  # Departure from 1021_03
        assert arr_str == "08:15:00"  # First arrival at 5061_01

    def test_graph_via_service_id_not_empty(self, wayfinder_real):
        """Verify service-specific graphs are populated (GroupBy fix)."""
        wf = wayfinder_real

        # Check that graph_via_service_id has non-empty graphs
        assert len(wf.graph_via_service_id) > 0, "Should have service_id graphs"

        for service_id, graph in wf.graph_via_service_id.items():
            assert graph.number_of_edges() > 0, (
                f"Graph for {service_id} should have edges"
            )
            assert graph.number_of_nodes() > 0, (
                f"Graph for {service_id} should have nodes"
            )
