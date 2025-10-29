"""Tests for ISO datetime conversion and field population in PR #3."""

import pytest

from gtfs_jp_wayfinder.services import wayfinder_adapter


class TestMergeDateAndTimeToIso:
    """Unit tests for the merge_date_and_time_to_iso utility function."""

    def test_basic_conversion(self):
        """Test basic conversion of date and HH:MM:SS time to ISO datetime."""
        result = wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", "14:30:00")
        assert result == "2025-10-28T14:30:00"

    def test_hm_format_no_seconds(self):
        """Test conversion with HH:MM format (no seconds)."""
        result = wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", "14:30")
        assert result == "2025-10-28T14:30:00"

    def test_midnight(self):
        """Test conversion at midnight."""
        result = wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", "00:00:00")
        assert result == "2025-10-28T00:00:00"

    def test_end_of_day(self):
        """Test conversion at end of day."""
        result = wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", "23:59:59")
        assert result == "2025-10-28T23:59:59"

    def test_none_time(self):
        """Test that None time raises ValueError."""
        with pytest.raises(ValueError):
            wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", None)

    def test_none_date(self):
        """Test that None date raises ValueError."""
        with pytest.raises(ValueError):
            wayfinder_adapter.merge_date_and_time_to_iso(None, "14:30:00")

    def test_empty_date(self):
        """Test that empty date raises ValueError."""
        with pytest.raises(ValueError):
            wayfinder_adapter.merge_date_and_time_to_iso("", "14:30:00")

    def test_invalid_time_format(self):
        """Test that invalid time format raises ValueError."""
        with pytest.raises(ValueError):
            wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", "25:70:99")

    def test_invalid_date_format(self):
        """Test that invalid date format raises ValueError."""
        with pytest.raises(ValueError):
            wayfinder_adapter.merge_date_and_time_to_iso("not-a-date", "14:30:00")

    def test_leap_year_conversion(self):
        """Test conversion on leap year date."""
        result = wayfinder_adapter.merge_date_and_time_to_iso("2024-02-29", "12:00:00")
        assert result == "2024-02-29T12:00:00"

    def test_leading_zeros_preserved(self):
        """Test that leading zeros in time are preserved."""
        result = wayfinder_adapter.merge_date_and_time_to_iso("2025-10-28", "09:05:03")
        assert result == "2025-10-28T09:05:03"


class TestEndpointDatetimeFields:
    """Integration tests verifying endpoints return datetime fields correctly."""

    def test_upcoming_hardcoded_has_datetime_fields(self, client, monkeypatch):
        """Test that /stops/upcoming with monkeypatched data returns datetime fields."""
        import json
        from pathlib import Path

        fixture_path = Path(__file__).parent / "fixtures" / "upcoming_1021_01.json"
        expected = json.loads(fixture_path.read_text(encoding="utf-8"))

        trips = [b["trip_id"] for b in expected["buses"]]

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
            lambda stop_id, service_id=None: trips,
        )

        time_map = {
            b["trip_id"]: {
                "trip_id": b["trip_id"],
                "arrival_time": b["arrival_time"],
                "departure_time": b["departure_time"],
            }
            for b in expected["buses"]
        }

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
            lambda trip_ids, stop_id, **kwargs: time_map,
        )

        response = client.get("/stops/1021/upcoming?begin_time=2025-10-28T10:00:00")
        assert response.status_code == 200
        data = response.json()

        # Verify datetime fields are present
        if len(data.get("buses", [])) > 0:
            bus = data["buses"][0]
            assert "arrival_datetime" in bus
            assert "departure_datetime" in bus
            # If we have both time and datetime, datetime should include the date
            if bus.get("arrival_time") and bus.get("arrival_datetime"):
                assert "2025-10-28" in bus["arrival_datetime"]


class TestDatetimeFieldConsistency:
    """Tests verifying that datetime and time fields are consistent."""

    def test_datetime_time_portion_matches_time_field(self, client, monkeypatch):
        """Verify that datetime field's time portion matches the original time field."""
        import json
        from pathlib import Path

        fixture_path = Path(__file__).parent / "fixtures" / "upcoming_1021_01.json"
        expected = json.loads(fixture_path.read_text(encoding="utf-8"))

        trips = [b["trip_id"] for b in expected["buses"]]

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
            lambda stop_id, service_id=None: trips,
        )

        time_map = {
            b["trip_id"]: {
                "trip_id": b["trip_id"],
                "arrival_time": b["arrival_time"],
                "departure_time": b["departure_time"],
            }
            for b in expected["buses"]
        }

        monkeypatch.setattr(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
            lambda trip_ids, stop_id, **kwargs: time_map,
        )

        response = client.get("/stops/1021/upcoming?begin_time=2025-10-28T10:00:00")
        assert response.status_code == 200
        data = response.json()

        if len(data.get("buses", [])) > 0:
            bus = data["buses"][0]
            if bus.get("arrival_time") and bus.get("arrival_datetime"):
                # Extract time portion from datetime
                datetime_time = bus["arrival_datetime"].split("T")[1]
                # Compare hours and minutes (arrival_time may have seconds)
                arrival_time_parts = bus["arrival_time"].split(":")
                datetime_time_parts = datetime_time.split(":")
                assert arrival_time_parts[0] == datetime_time_parts[0]  # hours
                assert arrival_time_parts[1] == datetime_time_parts[1]  # minutes
