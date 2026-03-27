"""Tests for date-to-service_id lookup functions.

These tests verify the core infrastructure for calendar-based filtering,
which is essential for showing only buses that run on the requested day.
"""

import datetime

import pytest

from gtfs_jp_wayfinder.services import wayfinder as wf_service
from gtfs_jp_wayfinder.services import wayfinder_adapter as adapter


class TestNormalizeDateToGtfsFormat:
    """Tests for the date normalization helper function."""

    def test_iso_format_to_gtfs(self):
        """ISO date (YYYY-MM-DD) should be converted to GTFS format (YYYYMMDD)."""
        result = wf_service._normalize_date_to_gtfs_format("2025-01-20")
        assert result == "20250120"

    def test_gtfs_format_unchanged(self):
        """GTFS format (YYYYMMDD) should remain unchanged."""
        result = wf_service._normalize_date_to_gtfs_format("20250120")
        assert result == "20250120"

    def test_invalid_format_raises_error(self):
        """Invalid date formats should raise ValueError."""
        with pytest.raises(ValueError, match="Invalid date format"):
            wf_service._normalize_date_to_gtfs_format("2025/01/20")

    def test_short_date_raises_error(self):
        """Too short date strings should raise ValueError."""
        with pytest.raises(ValueError, match="Invalid date format"):
            wf_service._normalize_date_to_gtfs_format("202501")

    def test_non_numeric_raises_error(self):
        """Non-numeric date strings should raise ValueError."""
        with pytest.raises(ValueError, match="Invalid date format"):
            wf_service._normalize_date_to_gtfs_format("2025-0a-20")

    def test_empty_string_raises_error(self):
        """Empty string should raise ValueError."""
        with pytest.raises(ValueError, match="Invalid date format"):
            wf_service._normalize_date_to_gtfs_format("")


class TestGetServiceIdsForDate:
    """Tests for wayfinder.get_service_ids_for_date function.

    Note: These tests require real GTFS data to be loaded.
    """

    @pytest.fixture(autouse=True)
    def ensure_initialized(self, client):
        """Ensure wayfinder is initialized before tests."""
        assert wf_service.is_ready(), "Wayfinder should be initialized"

    def test_returns_list(self):
        """Function should return a list (possibly empty)."""
        # Use a date that might be in the GTFS calendar range
        result = wf_service.get_service_ids_for_date("2025-01-20")
        assert isinstance(result, list)

    def test_iso_format_works(self):
        """ISO date format (YYYY-MM-DD) should work."""
        result = wf_service.get_service_ids_for_date("2025-01-20")
        assert isinstance(result, list)

    def test_gtfs_format_works(self):
        """GTFS date format (YYYYMMDD) should work."""
        result = wf_service.get_service_ids_for_date("20250120")
        assert isinstance(result, list)

    def test_same_result_both_formats(self):
        """Both date formats should return the same result."""
        iso_result = wf_service.get_service_ids_for_date("2025-01-20")
        gtfs_result = wf_service.get_service_ids_for_date("20250120")
        assert iso_result == gtfs_result

    def test_date_outside_range_returns_empty(self):
        """Date outside GTFS calendar range should return empty list."""
        # Use a date far in the past that shouldn't be in any GTFS calendar
        result = wf_service.get_service_ids_for_date("1999-01-01")
        assert result == []

    def test_invalid_format_raises_error(self):
        """Invalid date format should raise ValueError."""
        with pytest.raises(ValueError):
            wf_service.get_service_ids_for_date("invalid-date")


class TestGetTripServiceId:
    """Tests for wayfinder.get_trip_service_id function."""

    @pytest.fixture(autouse=True)
    def ensure_initialized(self, client):
        """Ensure wayfinder is initialized before tests."""
        assert wf_service.is_ready(), "Wayfinder should be initialized"

    def test_returns_string(self, client):
        """Function should return a string for valid trip_id."""
        # Get a valid trip_id from the stops endpoint first
        response = client.get("/stops/1021_01/upcoming?limit=1")
        if response.status_code == 200 and response.json().get("buses"):
            trip_id = response.json()["buses"][0]["trip_id"]
            result = wf_service.get_trip_service_id(trip_id)
            assert isinstance(result, str)
            assert len(result) > 0

    def test_invalid_trip_raises_error(self):
        """Invalid trip_id should raise ValueError."""
        with pytest.raises(ValueError, match="No trip with given trip_id found"):
            wf_service.get_trip_service_id("invalid_trip_id_12345")


class TestAdapterGetServiceIdsForDate:
    """Tests for wayfinder_adapter.get_service_ids_for_date function."""

    @pytest.fixture(autouse=True)
    def ensure_initialized(self, client):
        """Ensure wayfinder is initialized before tests."""
        assert adapter.is_ready(), "Wayfinder adapter should be ready"

    def test_returns_list(self):
        """Function should return a list."""
        result = adapter.get_service_ids_for_date("2025-01-20")
        assert isinstance(result, list)

    def test_matches_wayfinder_result(self):
        """Adapter should return same result as underlying wayfinder."""
        adapter_result = adapter.get_service_ids_for_date("2025-01-20")
        wayfinder_result = wf_service.get_service_ids_for_date("2025-01-20")
        assert adapter_result == wayfinder_result


class TestAdapterGetServiceIdsForDatetime:
    """Tests for wayfinder_adapter.get_service_ids_for_datetime function."""

    @pytest.fixture(autouse=True)
    def ensure_initialized(self, client):
        """Ensure wayfinder is initialized before tests."""
        assert adapter.is_ready(), "Wayfinder adapter should be ready"

    def test_with_datetime_object(self):
        """Should work with datetime object."""
        dt = datetime.datetime(2025, 1, 20, 14, 30, 0)
        result = adapter.get_service_ids_for_datetime(dt)
        assert isinstance(result, list)

    def test_with_iso_datetime_string(self):
        """Should work with ISO datetime string."""
        result = adapter.get_service_ids_for_datetime("2025-01-20T14:30:00")
        assert isinstance(result, list)

    def test_with_iso_date_string(self):
        """Should work with ISO date string (without time)."""
        result = adapter.get_service_ids_for_datetime("2025-01-20")
        assert isinstance(result, list)

    def test_with_none_returns_today(self):
        """None should use current date and return a list."""
        result = adapter.get_service_ids_for_datetime(None)
        assert isinstance(result, list)

    def test_datetime_matches_date_result(self):
        """Datetime should return same result as just the date."""
        dt_result = adapter.get_service_ids_for_datetime("2025-01-20T14:30:00")
        date_result = adapter.get_service_ids_for_date("2025-01-20")
        assert dt_result == date_result

    def test_invalid_format_raises_error(self):
        """Invalid datetime format should raise ValueError."""
        with pytest.raises(ValueError):
            adapter.get_service_ids_for_datetime("not-a-valid-datetime")


class TestAdapterGetTripServiceId:
    """Tests for wayfinder_adapter.get_trip_service_id function."""

    @pytest.fixture(autouse=True)
    def ensure_initialized(self, client):
        """Ensure wayfinder is initialized before tests."""
        assert adapter.is_ready(), "Wayfinder adapter should be ready"

    def test_returns_string(self, client):
        """Function should return a string for valid trip_id."""
        # Get a valid trip_id from the stops endpoint first
        response = client.get("/stops/1021_01/upcoming?limit=1")
        if response.status_code == 200 and response.json().get("buses"):
            trip_id = response.json()["buses"][0]["trip_id"]
            result = adapter.get_trip_service_id(trip_id)
            assert isinstance(result, str)
            assert len(result) > 0

    def test_matches_wayfinder_result(self, client):
        """Adapter should return same result as underlying wayfinder."""
        response = client.get("/stops/1021_01/upcoming?limit=1")
        if response.status_code == 200 and response.json().get("buses"):
            trip_id = response.json()["buses"][0]["trip_id"]
            adapter_result = adapter.get_trip_service_id(trip_id)
            wayfinder_result = wf_service.get_trip_service_id(trip_id)
            assert adapter_result == wayfinder_result
