"""Datetime conversion utilities for GTFS time handling."""

import numpy as np
from pandas import to_datetime


def np_datetime_to_time_str(np_datetime: np.datetime64 | None) -> str | None:
    """Convert numpy.datetime64 to HH:MM:SS string format.

    Args:
        np_datetime: A numpy datetime64 value, or None.

    Returns:
        Time string in HH:MM:SS format, or None if input is None or conversion fails.
    """
    if np_datetime is None:
        return None

    try:
        # Convert to pandas datetime for better handling
        pd_datetime = to_datetime(np_datetime)

        # Extract time in HH:MM:SS format
        return pd_datetime.strftime("%H:%M:%S")
    except Exception:
        return None
