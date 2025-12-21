"""Tests for wayfinder_adapter utility functions."""

import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest

from gtfs_jp_wayfinder.services.wayfinder_adapter import parse_split_date_str


class TestParseSplitDateStr:
    """Test cases for parse_split_date_str function."""

    def test_parse_split_date_str_with_hh_mm_ss(self):
        """Test parsing HH:MM:SS format."""
        reference_date, time_string = parse_split_date_str("14:30:00")

        # When given HH:MM:SS, it should return today's date and the input time
        assert reference_date == datetime.date.today()
        assert time_string == "14:30:00"

    def test_parse_split_date_str_with_iso_datetime(self):
        """Test parsing ISO 8601 datetime format."""
        reference_date, time_string = parse_split_date_str("2025-10-28T14:30:00")

        assert reference_date == datetime.date(2025, 10, 28)
        assert time_string == "14:30:00"

    def test_parse_split_date_str_with_iso_datetime_with_seconds(self):
        """Test parsing ISO datetime with seconds."""
        reference_date, time_string = parse_split_date_str("2025-10-28T09:15:45")

        assert reference_date == datetime.date(2025, 10, 28)
        assert time_string == "09:15:45"

    def test_parse_split_date_str_none(self):
        """Test that None returns current datetime."""
        # Mock datetime.datetime.now to return a known value in Asia/Tokyo timezone
        mock_dt = datetime.datetime(
            2025, 10, 28, 23, 30, 0, tzinfo=ZoneInfo("Asia/Tokyo")
        )

        with patch(
            "gtfs_jp_wayfinder.services.wayfinder_adapter.datetime"
        ) as mock_datetime:
            mock_datetime.datetime.now.return_value = mock_dt
            mock_datetime.date.today = (
                datetime.date.today
            )  # Keep other date functions working
            mock_datetime.date = datetime.date

            reference_date, time_string = parse_split_date_str(None)

            # Should return the mocked date and time
            assert reference_date == datetime.date(2025, 10, 28)
            assert time_string == "23:30:00"

    def test_parse_split_date_str_none_format(self):
        """Test that None returns properly formatted time string."""
        _, time_string = parse_split_date_str(None)

        # Time string should be in HH:MM:SS format
        time_parts = time_string.split(":")
        assert len(time_parts) == 3
        assert all(part.isdigit() for part in time_parts)
        assert 0 <= int(time_parts[0]) <= 23  # hours
        assert 0 <= int(time_parts[1]) <= 59  # minutes
        assert 0 <= int(time_parts[2]) <= 59  # seconds

    def test_parse_split_date_str_invalid_iso(self):
        """Test that invalid ISO format raises ValueError."""
        with pytest.raises(ValueError, match="Invalid ISO datetime format"):
            parse_split_date_str("2025-10-28T25:00:00")  # Invalid hour

        with pytest.raises(ValueError, match="Invalid ISO datetime format"):
            parse_split_date_str("2025-13-01T12:00:00")  # Invalid month

    def test_parse_split_date_str_iso_with_timezone(self):
        """Test parsing ISO datetime with timezone info."""
        # Python's fromisoformat supports basic timezone info
        reference_date, time_string = parse_split_date_str("2025-10-28T14:30:00+09:00")

        assert reference_date == datetime.date(2025, 10, 28)
        assert time_string == "14:30:00"

    def test_parse_split_date_str_iso_different_dates(self):
        """Test ISO datetime with various dates."""
        test_cases = [
            ("2025-01-01T00:00:00", datetime.date(2025, 1, 1), "00:00:00"),
            ("2025-12-31T23:59:59", datetime.date(2025, 12, 31), "23:59:59"),
            (
                "2024-02-29T12:00:00",
                datetime.date(2024, 2, 29),
                "12:00:00",
            ),  # Leap year
        ]

        for iso_string, expected_date, expected_time in test_cases:
            reference_date, time_string = parse_split_date_str(iso_string)
            assert reference_date == expected_date
            assert time_string == expected_time
