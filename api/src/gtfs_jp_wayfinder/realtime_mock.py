"""Mock GTFS-JP Real-time data generator.

This module provides mock trip update data following GTFS-JP Real-time specification.
In the future, this will be replaced with actual GTFS-JP Real-time data fetching.
"""

import datetime
import random
from typing import Any

from gtfs_jp_wayfinder import models


def generate_mock_realtime_update(
    trip_id: str,  # noqa: ARG001 - Reserved for future GTFS-JP Real-time integration
    stop_id: str,  # noqa: ARG001 - Reserved for future GTFS-JP Real-time integration
    scheduled_arrival_time: str,
    scheduled_departure_time: str,
    reference_date: str,
) -> models.RealtimeUpdate | None:
    """Generate mock GTFS-JP Real-time update for a trip at a stop.

    Args:
        trip_id: Trip identifier (reserved for matching against GTFS-JP Real-time feed)
        stop_id: Stop identifier (reserved for stop-specific delay calculation)
        scheduled_arrival_time: Scheduled arrival time in HH:MM:SS format
        scheduled_departure_time: Scheduled departure time in HH:MM:SS format
        reference_date: Reference date in YYYY-MM-DD format

    Returns:
        RealtimeUpdate object with mock delay and forecasted times, or None
        if no update is available (20% probability).

    Note:
        In future implementation, trip_id and stop_id will be used to query
        actual GTFS-JP Real-time feed for trip-specific and stop-specific delays.
    """
    # 20% chance of no realtime update available
    if random.random() < 0.2:
        return None

    # Generate random delay between -120 seconds (2 min early) and 600 seconds (10 min late)
    # Most buses should be close to on-time, so use a weighted distribution
    delay_options = [
        0,  # On time - 30% probability
        0,
        0,
        30,  # 30 seconds late - 20%
        30,
        60,  # 1 minute late - 15%
        60,
        120,  # 2 minutes late - 10%
        180,  # 3 minutes late - 8%
        240,  # 4 minutes late - 5%
        300,  # 5 minutes late - 4%
        360,  # 6 minutes late - 3%
        420,  # 7 minutes late - 2%
        480,  # 8 minutes late - 1%
        540,  # 9 minutes late - 1%
        600,  # 10 minutes late - 1%
        -30,  # 30 seconds early
        -60,  # 1 minute early
        -120,  # 2 minutes early
    ]
    delay_seconds = random.choice(delay_options)

    # Calculate forecasted times by adding delay to scheduled times
    try:
        # Parse scheduled times
        arrival_dt = datetime.datetime.strptime(
            f"{reference_date}T{scheduled_arrival_time}",
            "%Y-%m-%dT%H:%M:%S",
        )
        departure_dt = datetime.datetime.strptime(
            f"{reference_date}T{scheduled_departure_time}",
            "%Y-%m-%dT%H:%M:%S",
        )

        # Add delay
        forecasted_arrival_dt = arrival_dt + datetime.timedelta(seconds=delay_seconds)
        forecasted_departure_dt = departure_dt + datetime.timedelta(
            seconds=delay_seconds,
        )

        # Format times
        forecasted_arrival_time = forecasted_arrival_dt.strftime("%H:%M:%S")
        forecasted_departure_time = forecasted_departure_dt.strftime("%H:%M:%S")
        forecasted_arrival_datetime = forecasted_arrival_dt.strftime("%Y-%m-%dT%H:%M:%S")
        forecasted_departure_datetime = forecasted_departure_dt.strftime(
            "%Y-%m-%dT%H:%M:%S",
        )

        return models.RealtimeUpdate(
            delay_seconds=delay_seconds,
            forecasted_arrival_time=forecasted_arrival_time,
            forecasted_departure_time=forecasted_departure_time,
            forecasted_arrival_datetime=forecasted_arrival_datetime,
            forecasted_departure_datetime=forecasted_departure_datetime,
        )
    except (ValueError, TypeError):
        # If time parsing fails, return None
        return None


def get_trip_realtime_updates(
    trip_id: str,
    stop_id: str | None = None,  # noqa: ARG001 - Reserved for future use
) -> dict[str, Any] | None:
    """Get mock real-time updates for a trip (placeholder for future implementation).

    Args:
        trip_id: Trip identifier
        stop_id: Optional stop identifier to get updates for specific stop

    Returns:
        Dictionary containing trip update information, or None if no updates available.

    Note:
        This function is currently not used but is reserved for future batch
        fetching of trip updates from GTFS-JP Real-time feed. The current
        implementation generates updates per stop-time via generate_mock_realtime_update().

        Future implementation would:
        1. Fetch GTFS-JP Real-time feed
        2. Find TripUpdate for the given trip_id
        3. Return structured trip update data for all stops
        4. Cache results with appropriate TTL
    """
    # Mock implementation - placeholder for future batch trip update fetching
    # Current flow: updates generated per stop via generate_mock_realtime_update()
    return {"trip_id": trip_id, "has_updates": True}
