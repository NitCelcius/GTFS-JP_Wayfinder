"""Distance calculation utilities for geospatial operations."""

import math
from abc import ABC, abstractmethod

import pandas as pd


class DistanceCalculator(ABC):
    """Abstract base class for distance calculation methods."""

    @abstractmethod
    def calculate_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """Calculate distance between two points in kilometers."""
        pass

    def calculate_distances_batch(
        self, user_lat: float, user_lon: float, stops_df: pd.DataFrame
    ) -> list[float]:
        """Calculate distances to multiple stops efficiently. Override for batch optimization."""
        distances = []
        for _, row in stops_df.iterrows():
            stop_lat = float(row["stop_lat"])
            stop_lon = float(row["stop_lon"])
            distance = self.calculate_distance(user_lat, user_lon, stop_lat, stop_lon)
            distances.append(distance)
        return distances


class HaversineDistanceCalculator(DistanceCalculator):
    """Accurate distance calculation using Haversine formula."""

    def calculate_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """
        Calculate the great circle distance in kilometers between two points
        on the earth (specified in decimal degrees).

        Uses the Haversine formula for accurate distance calculation.

        Args:
            lat1, lon1: Latitude and longitude of first point in decimal degrees
            lat2, lon2: Latitude and longitude of second point in decimal degrees

        Returns:
            Distance in kilometers
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        # Radius of Earth in kilometers
        r = 6371.0

        return r * c


class EuclideanDistanceCalculator(DistanceCalculator):
    """Fast approximation using Euclidean distance. Less accurate for geographic coordinates."""

    def calculate_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """
        Calculate approximate distance using Euclidean formula.

        Less accurate than Haversine but much faster for rough calculations.
        Converts degrees to approximate kilometers using simple scaling.

        Args:
            lat1, lon1: Latitude and longitude of first point in decimal degrees
            lat2, lon2: Latitude and longitude of second point in decimal degrees

        Returns:
            Approximate distance in kilometers
        """
        # Approximate conversion: 1 degree ≈ 111 km
        lat_diff = (lat2 - lat1) * 111.0
        lon_diff = (lon2 - lon1) * 111.0 * math.cos(math.radians((lat1 + lat2) / 2))
        return math.sqrt(lat_diff**2 + lon_diff**2)
