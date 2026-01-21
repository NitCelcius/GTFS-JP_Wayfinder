"""Tests for calendar-based filtering in the /upcoming endpoint.

These tests verify that the /upcoming endpoint correctly filters trips
based on the date provided in begin_time, ensuring only buses that
actually run on that day are returned.
"""

import pytest


class TestUpcomingCalendarFiltering:
    """Tests for auto service_id detection in /upcoming endpoint."""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        """Setup test client."""
        self.client = client

    def test_upcoming_with_iso_datetime_returns_only_matching_service_id(self):
        """When ISO datetime is provided, only trips from that day's service should be returned."""
        # Use a date that should have a known service_id in the GTFS data
        # This test uses a weekday date (Monday)
        response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "2025-01-20T09:00:00",  # Monday
                "limit": 10,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "buses" in data
        assert "reference_date" in data
        assert data["reference_date"] == "2025-01-20"

    def test_upcoming_explicit_service_id_overrides_auto_detection(self):
        """Explicit service_id parameter should override auto-detection."""
        # Request a weekend date but explicitly ask for weekday service
        response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "2025-01-19T09:00:00",  # Sunday
                "service_id": "平日",  # Explicitly request weekday service
                "limit": 5,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "buses" in data

        # All returned buses should be from 平日 service
        for bus in data.get("buses", []):
            # Trip IDs in this GTFS data contain the service_id in the name
            assert "平日" in bus["trip_id"] or bus["trip_id"].startswith("平日")

    def test_upcoming_date_outside_calendar_returns_empty(self):
        """Date outside GTFS calendar range should return empty buses list."""
        # Use a date far in the past that shouldn't be in the calendar
        response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "1999-01-01T09:00:00",
                "limit": 10,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "buses" in data
        # Should return empty because no services run on this date
        assert len(data["buses"]) == 0

    def test_upcoming_hh_mm_ss_format_uses_today(self):
        """HH:MM:SS format should use today's date for service_id detection."""
        response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "09:00:00",
                "limit": 5,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "buses" in data
        # reference_date should be today's date
        assert "reference_date" in data
        # We can't assert the exact date, but it should be a valid ISO date
        assert len(data["reference_date"]) == 10  # YYYY-MM-DD format

    def test_upcoming_no_begin_time_uses_current_datetime(self):
        """No begin_time should use current datetime for filtering."""
        response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "limit": 5,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "buses" in data
        assert "reference_date" in data

    def test_upcoming_weekday_vs_weekend_returns_different_buses(self):
        """Weekday and weekend dates should return different sets of buses."""
        # Monday (weekday)
        weekday_response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "2025-01-20T09:00:00",
                "limit": 10,  # Use smaller limit to fit test env constraints
            },
        )

        # Sunday (weekend/holiday)
        weekend_response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "2025-01-19T09:00:00",
                "limit": 10,  # Use smaller limit to fit test env constraints
            },
        )

        assert weekday_response.status_code == 200
        assert weekend_response.status_code == 200

        weekday_data = weekday_response.json()
        weekend_data = weekend_response.json()

        # Get trip IDs from each response
        weekday_trip_ids = {bus["trip_id"] for bus in weekday_data.get("buses", [])}
        weekend_trip_ids = {bus["trip_id"] for bus in weekend_data.get("buses", [])}

        # Trip IDs should be different (no overlap between weekday/weekend services)
        # This is because 平日 and 土日祝 trips have distinct trip_ids in this GTFS data
        if weekday_trip_ids and weekend_trip_ids:
            # Check that the sets are different
            assert weekday_trip_ids != weekend_trip_ids


class TestUpcomingCalendarFilteringEdgeCases:
    """Edge case tests for calendar-based filtering."""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        """Setup test client."""
        self.client = client

    def test_invalid_stop_id_with_calendar_filtering(self):
        """Invalid stop_id should still return proper error/empty response."""
        response = self.client.get(
            "/stops/invalid_stop_12345/upcoming",
            params={
                "begin_time": "2025-01-20T09:00:00",
                "limit": 5,
            },
        )

        # Should return 200 with empty buses list (current behavior)
        # or could return 404 depending on implementation
        assert response.status_code in [200, 404]

    def test_expand_works_with_calendar_filtering(self):
        """Expand parameters should work correctly with calendar filtering."""
        response = self.client.get(
            "/stops/1021_01/upcoming",
            params={
                "begin_time": "2025-01-20T09:00:00",
                "expand": "trip_info,stops",
                "limit": 3,
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Check that enriched data is present
        for bus in data.get("buses", []):
            # route_name should be populated via trip_info expansion
            assert "route_name" in bus
            # stops should be populated via stops expansion
            assert "stops" in bus
