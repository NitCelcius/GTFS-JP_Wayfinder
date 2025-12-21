"""Tests for GTFS-JP Real-time update functionality."""

import datetime

import pandas as pd
from fastapi.testclient import TestClient

from gtfs_jp_wayfinder import realtime_mock
from gtfs_jp_wayfinder.main import app

client = TestClient(app)


class TestRealtimeMockGeneration:
    """Test mock real-time update generation."""

    def test_generate_mock_realtime_update_returns_update(self):
        """Test that mock generation returns a RealtimeUpdate object."""
        # Run multiple times to account for randomness (20% chance of None)
        results = []
        for _ in range(20):
            update = realtime_mock.generate_mock_realtime_update(
                trip_id="test_trip",
                stop_id="test_stop",
                scheduled_arrival_time="08:00:00",
                scheduled_departure_time="08:00:00",
                reference_date="2025-10-28",
            )
            results.append(update)

        # At least some results should be non-None
        non_none_results = [r for r in results if r is not None]
        assert len(non_none_results) > 0, "Should generate some real-time updates"

        # Check structure of non-None results
        for update in non_none_results:
            assert hasattr(update, "delay_seconds")
            assert hasattr(update, "forecasted_arrival_time")
            assert hasattr(update, "forecasted_departure_time")
            assert hasattr(update, "forecasted_arrival_datetime")
            assert hasattr(update, "forecasted_departure_datetime")
            assert isinstance(update.delay_seconds, int)

    def test_generate_mock_realtime_update_delay_range(self):
        """Test that delays are within reasonable range."""
        updates = []
        for _ in range(50):
            update = realtime_mock.generate_mock_realtime_update(
                trip_id="test_trip",
                stop_id="test_stop",
                scheduled_arrival_time="08:00:00",
                scheduled_departure_time="08:00:00",
                reference_date="2025-10-28",
            )
            if update:
                updates.append(update)

        # Check delay range
        delays = [u.delay_seconds for u in updates]
        assert len(delays) > 0, "Should have some delays"
        assert all(-120 <= d <= 600 for d in delays), "Delays should be in range"

    def test_generate_mock_realtime_update_calculates_forecasted_times(self):
        """Test that forecasted times are correctly calculated."""
        update = None
        # Try multiple times to get a non-None result
        for _ in range(20):
            update = realtime_mock.generate_mock_realtime_update(
                trip_id="test_trip",
                stop_id="test_stop",
                scheduled_arrival_time="08:00:00",
                scheduled_departure_time="08:05:00",
                reference_date="2025-10-28",
            )
            if update:
                break

        # If we got an update, verify the time calculation
        if update:
            scheduled_dt = datetime.datetime.strptime(
                "2025-10-28T08:00:00",
                "%Y-%m-%dT%H:%M:%S",
            )
            forecasted_dt = datetime.datetime.strptime(
                update.forecasted_arrival_datetime,
                "%Y-%m-%dT%H:%M:%S",
            )
            time_diff = (forecasted_dt - scheduled_dt).total_seconds()
            assert time_diff == update.delay_seconds, "Time difference should match delay"


class TestJourneyEndpointWithRealtime:
    """Test /trips/journey endpoint with real-time updates."""

    def test_journey_includes_realtime_updates(self, client, monkeypatch):
        """Test that journey endpoint includes realtime_update field."""
        # Use the client fixture which initializes the wayfinder
        # Create mock journey data with dates in 1980 like the existing test
        df = pd.DataFrame(
            [
                {
                    "trip_id": "test_trip",
                    "stop_id": "stop1",
                    "fare": 170,
                    "departure_time": datetime.datetime(1980, 1, 1, 8, 0, 0),
                    "arrival_time": datetime.datetime(1980, 1, 1, 8, 0, 0),
                },
                {
                    "trip_id": "test_trip",
                    "stop_id": "stop2",
                    "fare": 200,
                    "departure_time": datetime.datetime(1980, 1, 1, 8, 10, 0),
                    "arrival_time": datetime.datetime(1980, 1, 1, 8, 10, 0),
                },
            ],
        )

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_journey",
            lambda trip_id, from_stop: df,
            raising=False,
        )

        response = client.get("/trips/journey?trip_id=test_trip&from_stop_id=stop1")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2

        # Check that realtime_update field exists (may be None or have data)
        for record in data:
            assert "realtime_update" in record
            # If realtime_update is present and not None, check its structure
            if record["realtime_update"]:
                assert "delay_seconds" in record["realtime_update"]
                assert "forecasted_arrival_time" in record["realtime_update"]
                assert "forecasted_departure_time" in record["realtime_update"]


class TestUpcomingEndpointWithRealtime:
    """Test /stops/{stop_id}/upcoming endpoint with real-time updates."""

    def test_upcoming_includes_realtime_updates(self, monkeypatch):
        """Test that upcoming endpoint includes realtime_update field."""
        stop_id = "test_stop"
        trips = ["trip1", "trip2"]

        time_map = {
            "trip1": {
                "arrival_time": "08:00:00",
                "departure_time": "08:00:00",
            },
            "trip2": {
                "arrival_time": "08:15:00",
                "departure_time": "08:15:00",
            },
        }

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
            lambda stop_id, service_id=None: trips,
        )

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
            lambda trip_ids, stop_id, **kwargs: {
                trip_id: time_map[trip_id] for trip_id in trip_ids if trip_id in time_map
            },
        )

        response = client.get(f"/stops/{stop_id}/upcoming")
        assert response.status_code == 200

        data = response.json()
        assert "buses" in data
        assert len(data["buses"]) > 0

        # Check that realtime_update field exists for all buses
        for bus in data["buses"]:
            assert "realtime_update" in bus
            # If realtime_update is present and not None, check its structure
            if bus["realtime_update"]:
                assert "delay_seconds" in bus["realtime_update"]
                assert "forecasted_arrival_time" in bus["realtime_update"]
                assert "forecasted_departure_time" in bus["realtime_update"]
                assert "forecasted_arrival_datetime" in bus["realtime_update"]
                assert "forecasted_departure_datetime" in bus["realtime_update"]


class TestRealtimeUpdateModel:
    """Test the RealtimeUpdate Pydantic model."""

    def test_realtime_update_model_validation(self):
        """Test that RealtimeUpdate model validates correctly."""
        from gtfs_jp_wayfinder.models import RealtimeUpdate

        # Test valid data
        update = RealtimeUpdate(
            delay_seconds=120,
            forecasted_arrival_time="08:02:00",
            forecasted_departure_time="08:02:00",
            forecasted_arrival_datetime="2025-10-28T08:02:00",
            forecasted_departure_datetime="2025-10-28T08:02:00",
        )
        assert update.delay_seconds == 120
        assert update.forecasted_arrival_time == "08:02:00"

        # Test with None values (all fields are optional)
        update_none = RealtimeUpdate()
        assert update_none.delay_seconds is None
        assert update_none.forecasted_arrival_time is None

    def test_trip_record_includes_realtime_update(self):
        """Test that TripRecord model includes realtime_update field."""
        from gtfs_jp_wayfinder.models import RealtimeUpdate, TripRecord

        # Create TripRecord with realtime_update
        update = RealtimeUpdate(
            delay_seconds=180,
            forecasted_arrival_time="08:03:00",
            forecasted_departure_time="08:03:00",
            forecasted_arrival_datetime="2025-10-28T08:03:00",
            forecasted_departure_datetime="2025-10-28T08:03:00",
        )

        record = TripRecord(
            trip_id="test_trip",
            stop_id="test_stop",
            fare=170,
            departure_time=datetime.time(8, 0, 0),
            arrival_time=datetime.time(8, 0, 0),
            departure_datetime="2025-10-28T08:00:00",
            arrival_datetime="2025-10-28T08:00:00",
            realtime_update=update,
        )

        assert record.realtime_update is not None
        assert record.realtime_update.delay_seconds == 180

    def test_enriched_trip_includes_realtime_update(self):
        """Test that EnrichedTrip model includes realtime_update field."""
        from gtfs_jp_wayfinder.models import EnrichedTrip, RealtimeUpdate

        # Create EnrichedTrip with realtime_update
        update = RealtimeUpdate(
            delay_seconds=60,
            forecasted_arrival_time="08:01:00",
            forecasted_departure_time="08:01:00",
            forecasted_arrival_datetime="2025-10-28T08:01:00",
            forecasted_departure_datetime="2025-10-28T08:01:00",
        )

        trip = EnrichedTrip(
            trip_id="test_trip",
            arrival_time="08:00:00",
            departure_time="08:00:00",
            arrival_datetime="2025-10-28T08:00:00",
            departure_datetime="2025-10-28T08:00:00",
            realtime_update=update,
        )

        assert trip.realtime_update is not None
        assert trip.realtime_update.delay_seconds == 60
