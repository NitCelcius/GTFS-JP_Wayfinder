import hashlib
import logging
import pickle
import warnings
from dataclasses import dataclass
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import networkx as nx
import numpy as np
import pandas as pd

from gtfs_jp_wayfinder.utils.distance import (
    DistanceCalculator,
    EuclideanDistanceCalculator,
    HaversineDistanceCalculator,
)

# Reserved trip ID for walk transfers between platforms at the same station.
# GTFS data must NOT contain this ID.
# TODO: Refactor to discriminated union with `type` field for type safety.
#       See GitHub issue for details: https://github.com/NitCelcius/GTFS-JP_Wayfinder/issues/143
WALK_TRANSFER_TRIP_ID = "WALK_TRANSFER"

logger = logging.getLogger(__name__)


def katakana_to_hiragana(text: str) -> str:
    """Convert katakana characters to hiragana.

    Args:
        text: String potentially containing katakana characters.

    Returns:
        String with katakana characters converted to hiragana.
    """
    result = []
    for char in text:
        # Katakana range: U+30A0 to U+30FF
        # Hiragana range: U+3040 to U+309F
        # Offset: 0x60 (96 in decimal)
        code = ord(char)
        if 0x30A0 <= code <= 0x30FF:
            # Convert katakana to hiragana by subtracting offset
            result.append(chr(code - 0x60))
        else:
            result.append(char)
    return "".join(result)


def hiragana_to_katakana(text: str) -> str:
    """Convert hiragana characters to katakana.

    Args:
        text: String potentially containing hiragana characters.

    Returns:
        String with hiragana characters converted to katakana.
    """
    result = []
    for char in text:
        # Hiragana range: U+3040 to U+309F
        # Katakana range: U+30A0 to U+30FF
        # Offset: 0x60 (96 in decimal)
        code = ord(char)
        if 0x3040 <= code <= 0x309F:
            # Convert hiragana to katakana by adding offset
            result.append(chr(code + 0x60))
        else:
            result.append(char)
    return "".join(result)


@dataclass
class TravelOnce:
    trip_id: str | list[str]
    fare: int
    arrival_time: np.datetime64 | None
    departure_time: np.datetime64 | None
    from_stop_id: str
    to_stop_id: str
    is_walk_transfer: bool = (
        False  # True when transferring between platforms at same stop
    )


@dataclass
class NearbyStopResult:
    """Result for a single nearby bus stop."""

    stop_id: str
    stop_name: str
    distance_km: float
    stop_lat: float
    stop_lon: float


class AkitaBusWayFinder:
    def __init__(self, use_haversine: bool = True):
        self.df_stops = None
        self.df_stop_times = None
        self.df_fare_id_route = None
        self.df_fare_id_cost = None
        self.df_trips = None
        self.df_routes = None
        self.df_agency = None
        self.date_to_service_id = None
        self.graph = None
        self.graph_via_service_id = dict()
        self.default_date = "2021-01-01"
        self.agency_timezone = "UTC"
        self._walk_transfer_pairs: set[tuple[str, str]] = set()

        # Performance optimization: Lookup indices built during initialize()
        # These caches trade memory for significant query speedup in route search
        self._trip_to_service_id: dict[str, str] = {}  # trip_id -> service_id
        self._stop_to_trips: dict[str, list[str]] = {}  # stop_id -> [trip_ids]
        self._trip_stop_times: dict[
            tuple[str, str], list[tuple[np.datetime64, np.datetime64, int]]
        ] = {}  # (trip_id, stop_id) -> [(arrival_time, departure_time, stop_sequence), ...]

        # Distance calculator - can be switched between Haversine and Euclidean
        self.distance_calculator: DistanceCalculator = (
            HaversineDistanceCalculator()
            if use_haversine
            else EuclideanDistanceCalculator()
        )

        # Translation support: maps translation (e.g., hiragana) -> original stop_name
        # This enables searching stops by their translated names (e.g., searching "あおばだい" finds "青葉台")
        self._translation_to_stop_name: dict[str, str] = {}

    # 文字列の時刻情報を numpy の datetime64 に変換する
    # 簡便な比較用のため日付を default_date にしているが無意味なので注意
    def time_str_to_np_datetime(self, time_str) -> np.datetime64:
        return np.datetime64(self.default_date + "T" + time_str)

    # Numpy の datetime64 を日付とミリ秒情報を捨てて、文字列に変換する
    # バスロケの時刻情報へ変換できる
    def np_datetime_truncate_to_str(self, np_datetime: np.datetime64) -> str:
        # 日付を捨てる
        date_and_time_split = str(np_datetime).split("T")
        if len(date_and_time_split) > 1:
            time_only = date_and_time_split[1]
        else:
            date_and_time_space_split = str(np_datetime).split(" ")
            # Tじゃない場合があるらしい
            time_only = date_and_time_space_split[1]

        # ミリ秒を捨てる
        time_only_dot_split = time_only.split(".")
        if len(time_only_dot_split) > 0:
            return time_only_dot_split[0]
        return time_only

    def _get_cache_path(self, base_dir: str) -> Path:
        """Get the path for the graph cache file."""
        return Path(base_dir) / ".graph_cache.pkl"

    def _get_data_hash(self, base_dir: str) -> str:
        """Get SHA-256 hash of GTFS data files for cache validation.

        This method computes a combined hash of all GTFS data files
        to determine if the cache is still valid. Any change to these files
        will result in a different hash, triggering cache regeneration.

        Only includes .txt files (standard GTFS format) and ignores files
        that don't exist, as not all GTFS-JP feeds contain all files.
        """
        # All standard GTFS and GTFS-JP files
        data_files = [
            "agency.txt",
            "calendar.txt",
            "calendar_dates.txt",
            "fare_attributes.txt",
            "fare_rules.txt",
            "feed_info.txt",
            "routes.txt",
            "shapes.txt",
            "stops.txt",
            "stop_times.txt",
            "translations.txt",
            "trips.txt",
        ]

        hasher = hashlib.sha256()

        for filename in sorted(data_files):  # Sort to ensure consistent ordering
            filepath = Path(base_dir) / filename
            if filepath.exists():
                # Read file in chunks to handle large files efficiently
                with open(filepath, "rb") as f:
                    for chunk in iter(lambda: f.read(8192), b""):
                        hasher.update(chunk)

        return hasher.hexdigest()

    def _save_graph_cache(self, base_dir: str) -> None:
        """Save generated graphs to cache file."""
        cache_path = self._get_cache_path(base_dir)
        cache_data = {
            "graph": self.graph,
            "graph_via_service_id": self.graph_via_service_id,
            "date_to_service_id": self.date_to_service_id,
            "_walk_transfer_pairs": self._walk_transfer_pairs,
            "data_hash": self._get_data_hash(base_dir),
        }
        try:
            with open(cache_path, "wb") as f:
                pickle.dump(cache_data, f, protocol=pickle.HIGHEST_PROTOCOL)
            logger.info("Graph cache saved to %s", cache_path)
        except Exception as e:
            logger.warning("Failed to save graph cache: %s", e)

    def _load_graph_cache(self, base_dir: str) -> bool:
        """Load graphs from cache if valid. Returns True if loaded successfully."""
        cache_path = self._get_cache_path(base_dir)

        if not cache_path.exists():
            logger.info("No graph cache found at %s", cache_path)
            return False

        try:
            with open(cache_path, "rb") as f:
                cache_data = pickle.load(f)

            # Validate cache freshness using SHA-256 hash
            cached_hash = cache_data.get("data_hash", "")
            current_hash = self._get_data_hash(base_dir)

            if current_hash != cached_hash:
                logger.info(
                    "Graph cache is stale (data has been modified), regenerating..."
                )
                return False

            # Load cached data
            self.graph = cache_data["graph"]
            self.graph_via_service_id = cache_data["graph_via_service_id"]
            self.date_to_service_id = cache_data["date_to_service_id"]
            self._walk_transfer_pairs = cache_data.get("_walk_transfer_pairs", set())

            logger.info("Graph cache loaded successfully from %s", cache_path)
            return True

        except Exception as e:
            logger.warning("Failed to load graph cache: %s", e)
            return False

    def initialize(self, base_dir: str = "../data/", use_cache_graph: bool = False):
        """Initialize the wayfinder with GTFS data.

        Loads GTFS data from the specified directory and generates routing graphs.
        If use_cache_graph is True and a valid cache exists, loads from cache instead.

        Args:
            base_dir: Directory path containing GTFS data files (must end with /).
            use_cache_graph: If True, use cached graph data if available and valid.
                           If False (default), always generate graphs from scratch.
        """
        logger.info("Loading dataframes...")
        # Agency info (timezone, etc.)
        # Try to read agency_timezone from GTFS data; fall back to Asia/Tokyo, then UTC
        try:
            agency_df = pd.read_csv(base_dir + "agency.txt")
            # Store the agency DataFrame for later retrieval
            self.df_agency = agency_df
            if "agency_timezone" in agency_df.columns and not agency_df.empty:
                tz_value = str(agency_df.iloc[0]["agency_timezone"])
                if tz_value:
                    try:
                        ZoneInfo(tz_value)  # Validate it's a valid IANA timezone
                        self.agency_timezone = tz_value
                    except ZoneInfoNotFoundError:
                        logger.warning(
                            "Invalid timezone in agency.txt: %s; falling back to Asia/Tokyo, then UTC.",
                            tz_value,
                        )
        except FileNotFoundError as err:
            raise FileNotFoundError(
                "Required txt file for GTFS-JP agency.txt is not found!"
            ) from err
        except Exception as exc:
            logger.warning(
                "Failed to read agency.txt (%s); using default timezone Asia/Tokyo.",
                exc,
            )
        # At this point, timezone is either from agency.txt, or the default "UTC" from __init__
        # Try Asia/Tokyo as fallback for GTFS-JP data if still using UTC
        if self.agency_timezone == "UTC":
            try:
                ZoneInfo("Asia/Tokyo")  # Validate Asia/Tokyo is available
                logger.info("Using Asia/Tokyo as fallback timezone for GTFS-JP data.")
                self.agency_timezone = "Asia/Tokyo"
            except ZoneInfoNotFoundError:
                logger.warning(
                    "Asia/Tokyo timezone not available; keeping UTC as fallback."
                )
        # バス停
        self.df_stops = pd.read_csv(base_dir + "stops.txt")
        # バス停の時刻、通過時刻と経路
        self.df_stop_times = pd.read_csv(
            base_dir + "stop_times.txt",
            converters={
                "arrival_time": self.time_str_to_np_datetime,
                "departure_time": self.time_str_to_np_datetime,
            },
        )
        # バス停どうしの料金IDと経路
        self.df_fare_id_route = pd.read_csv(base_dir + "fare_rules.txt")
        # バス停どうしの料金IDと料金
        self.df_fare_id_cost = pd.read_csv(base_dir + "fare_attributes.txt")
        # trip 関連
        self.df_trips = pd.read_csv(base_dir + "trips.txt")

        # Validate that GTFS data doesn't contain reserved trip ID
        if WALK_TRANSFER_TRIP_ID in self.df_trips["trip_id"].values:
            raise ValueError(
                f"GTFS data contains reserved trip_id '{WALK_TRANSFER_TRIP_ID}'. "
                "This ID is reserved for internal walk transfer representation."
            )

        # route の short_name 関連
        self.df_routes = pd.read_csv(base_dir + "routes.txt")
        # 日付から service id に変換
        self.date_to_service_id = None

        # Load translations.txt for searchable stop name translations (e.g., hiragana)
        self._load_stop_name_translations(base_dir)

        logger.info("Building lookup indices for performance...")
        self._build_lookup_indices()

        # Try to load from cache if enabled
        if use_cache_graph and self._load_graph_cache(base_dir):
            logger.info("Using cached graph data")
        else:
            # Generate graph from scratch
            logger.info("Generating Calendar...")
            self.generate_calendar(base_dir)

            logger.info("Generating Stops graph...")
            self.generate_graph()

            # Save to cache if enabled
            if use_cache_graph:
                self._save_graph_cache(base_dir)

        logger.info("Preparation completed!")

    def _load_stop_name_translations(self, base_dir: str) -> None:
        """Load stop name translations from translations.txt.

        This method loads translations for stop names (e.g., hiragana/katakana readings, English names)
        from the GTFS-JP translations.txt file. This enables searching for stops
        using their translated names (e.g., searching "あおばだい", "アオバダイ", or "Aobadai" will find "青葉台").

        The translations are stored in _translation_to_stop_name dict mapping
        translation -> original stop_name. Supports bidirectional hiragana/katakana conversion.

        Args:
            base_dir: Directory path containing GTFS data files.
        """
        translations_path = Path(base_dir) / "translations.txt"
        if not translations_path.exists():
            logger.info("No translations.txt found; skipping translation loading")
            return

        try:
            df_translations = pd.read_csv(translations_path)

            # Check which format we have based on available columns
            has_field_value = "field_value" in df_translations.columns
            has_record_id = "record_id" in df_translations.columns

            translations_dict = {}

            if has_field_value and not has_record_id:
                # Old format (2024): table_name,field_name,field_value,language,translation
                # translation contains the hiragana/katakana, field_value contains the original name
                stop_name_translations = df_translations[
                    (df_translations["table_name"] == "stops")
                    & (df_translations["field_name"] == "stop_name")
                ]

                # Build translation -> original stop_name mapping with bidirectional conversion
                for _, row in stop_name_translations.iterrows():
                    translation = row["translation"]
                    stop_name = row["field_value"]
                    language = row.get("language", "")

                    # Store the original translation
                    translations_dict[translation] = stop_name

                    # If it's hiragana/katakana, also store the converted version
                    # Only add variants that differ from the original to avoid redundant entries
                    if "Hrkt" in language or "hiragana" in language.lower():
                        # Convert hiragana to katakana and vice versa
                        katakana_version = hiragana_to_katakana(translation)
                        hiragana_version = katakana_to_hiragana(translation)
                        if katakana_version != translation:
                            translations_dict[katakana_version] = stop_name
                        if hiragana_version != translation:
                            translations_dict[hiragana_version] = stop_name

                self._translation_to_stop_name = translations_dict

            elif has_record_id:
                # New format (2025): table_name,field_name,language,translation,record_id,record_sub_id,field_value
                # translation contains the translated text, record_id is the stop_id
                # We need to join with stops DataFrame to get the actual stop_name

                # Filter for stop_name translations (ja-Hrkt for hiragana/katakana, en for English)
                stop_name_translations = df_translations[
                    (df_translations["table_name"] == "stops")
                    & (df_translations["field_name"] == "stop_name")
                    & (df_translations["language"].isin(["ja-Hrkt", "en"]))
                ].copy()

                # Join with stops DataFrame to get the actual stop_name
                # record_id in translations corresponds to stop_id in stops
                stop_name_translations = stop_name_translations.merge(
                    self.df_stops[["stop_id", "stop_name"]],
                    left_on="record_id",
                    right_on="stop_id",
                    how="inner",
                )

                # Build translation -> original stop_name mapping
                for _, row in stop_name_translations.iterrows():
                    translation = row["translation"]
                    stop_name = row["stop_name"]
                    language = row["language"]

                    # Store the original translation
                    translations_dict[translation] = stop_name

                    # For ja-Hrkt (hiragana/katakana), store both hiragana and katakana versions
                    # Only add variants that differ from the original to avoid redundant entries
                    if language == "ja-Hrkt":
                        katakana_version = hiragana_to_katakana(translation)
                        hiragana_version = katakana_to_hiragana(translation)
                        if katakana_version != translation:
                            translations_dict[katakana_version] = stop_name
                        if hiragana_version != translation:
                            translations_dict[hiragana_version] = stop_name

                self._translation_to_stop_name = translations_dict

            else:
                logger.warning(
                    "Unrecognized translations.txt format; skipping translation loading"
                )
                self._translation_to_stop_name = {}
                return

            logger.info(
                "Loaded %d stop name translations",
                len(self._translation_to_stop_name),
            )
        except Exception as e:
            logger.warning("Failed to load translations.txt: %s", e)
            self._translation_to_stop_name = {}

    def _build_lookup_indices(self):
        """Build lookup indices for faster query performance.

        This method creates in-memory dictionaries that trade memory for
        significant speed improvements in route search operations.
        """
        # Build trip_id -> service_id lookup (used by get_trip_service_id)
        self._trip_to_service_id = dict(
            zip(
                self.df_trips["trip_id"],
                self.df_trips["service_id"],
                strict=True,
            )
        )
        logger.info(
            "Built trip->service_id index with %d entries",
            len(self._trip_to_service_id),
        )

        # Build stop_id -> [trip_ids] lookup (used by get_trips_from_stops)
        # Use groupby for efficient deduplication instead of O(n²) membership checks
        self._stop_to_trips = (
            self.df_stop_times.groupby("stop_id")["trip_id"]
            .apply(lambda x: list(x.unique()))
            .to_dict()
        )
        logger.info(
            "Built stop->trips index with %d stops",
            len(self._stop_to_trips),
        )

        # Build (trip_id, stop_id) -> list[(arrival_time, departure_time, stop_sequence)]
        # Used by get_trip_times and get_trips_from_stops for faster sequence lookups
        # Note: Some trips visit the same stop multiple times (circular routes), so we store a list
        # Use itertuples() for better performance than iterrows()
        self._trip_stop_times = {}
        for row in self.df_stop_times.itertuples(index=False):
            key = (row.trip_id, row.stop_id)
            entry = (
                row.arrival_time,
                row.departure_time,
                row.stop_sequence,
            )
            self._trip_stop_times.setdefault(key, []).append(entry)

        # Count total entries (including multiple visits to same stop)
        total_entries = sum(len(v) for v in self._trip_stop_times.values())
        logger.info(
            "Built (trip,stop)->times index with %d unique keys, %d total entries",
            len(self._trip_stop_times),
            total_entries,
        )

    def generate_graph(self):
        def generate_edges_from_grouped_trips(grouped_trips):
            """Generate edges from grouped trips iterable.

            Args:
                grouped_trips: Iterable of (trip_id, df_trip) tuples

            Returns:
                List of (from_stop, to_stop) edge tuples
            """
            edges = []
            for _trip_id, df_trip in grouped_trips:
                df_trip = df_trip.sort_values(by=["stop_sequence"])
                stop_ids = df_trip["stop_id"].values
                stop_ids_count = len(stop_ids)

                # 自己ループを除いてすべてつなげる
                edges.extend(
                    [
                        (stop_ids[i], stop_ids[j])
                        for i in range(stop_ids_count)
                        for j in range(i + 1, stop_ids_count)
                    ],
                )
            return edges

        logger.info("Generating merged graph...")
        self.graph = nx.DiGraph()

        # Convert GroupBy to list so it can be iterated multiple times
        # (GroupBy objects can only be iterated once)
        all_trips_grouped = list(self.df_stop_times.groupby("trip_id"))
        all_edges = generate_edges_from_grouped_trips(all_trips_grouped)
        self.graph.add_edges_from(all_edges)

        # Add zero-weight edges between stops with the same name (platform transfers)
        logger.info("Adding walk transfer edges between same-name stops...")
        walk_transfer_edges = self._generate_walk_transfer_edges()
        self.graph.add_edges_from(walk_transfer_edges)
        logger.info("Added %d walk transfer edges", len(walk_transfer_edges))

        # Build set of walk transfer pairs for quick lookup
        self._walk_transfer_pairs = set(walk_transfer_edges)

        logger.info("Generating graphs for each service_id...")
        self.graph_via_service_id = dict()

        # Pre-compute service_id -> trip_ids mapping for efficient filtering
        service_to_trips = {}
        for service_id in self.df_trips["service_id"].value_counts().index:
            service_to_trips[service_id] = set(
                self.df_trips[self.df_trips["service_id"] == service_id]["trip_id"]
            )

        for service_id, trip_ids_set in service_to_trips.items():
            logger.info("Generating graph for service_id: %s", service_id)
            self.graph_via_service_id[service_id] = nx.DiGraph()

            # Filter grouped trips by service_id and reuse helper function
            service_trips = [
                (tid, df) for tid, df in all_trips_grouped if tid in trip_ids_set
            ]
            service_edges = generate_edges_from_grouped_trips(service_trips)
            self.graph_via_service_id[service_id].add_edges_from(service_edges)
            # Also add walk transfer edges to service-specific graphs
            self.graph_via_service_id[service_id].add_edges_from(walk_transfer_edges)

    def _generate_walk_transfer_edges(self) -> list[tuple[str, str]]:
        """Generate bidirectional edges between stops with the same name.

        This enables routing through platform transfers at the same station.
        Returns a list of (from_stop_id, to_stop_id) tuples.
        """
        edges = []
        # Group stops by name
        stops_by_name = self.df_stops.groupby("stop_name")["stop_id"].apply(list)

        # Note: Using .items() is correct here because stops_by_name is a pandas Series
        # where we need both the index (stop_name) and values (stop_ids list).
        # The ruff PERF102 suggestion to use .values() is incorrect for pandas Series.
        for _stop_name, stop_ids in stops_by_name.items():  # noqa: PERF102
            if len(stop_ids) > 1:
                # Create bidirectional edges between all stops with the same name
                for i, stop_id_a in enumerate(stop_ids):
                    for stop_id_b in stop_ids[i + 1 :]:
                        edges.append((stop_id_a, stop_id_b))
                        edges.append((stop_id_b, stop_id_a))

        return edges

    def is_walk_transfer(self, from_stop_id: str, to_stop_id: str) -> bool:
        """Check if the transition between two stops is a walk transfer (same-name stops)."""
        return (from_stop_id, to_stop_id) in self._walk_transfer_pairs

    def generate_calendar(self, base_dir):
        df_base_calendar = pd.read_csv(base_dir + "calendar.txt")
        df_calendar_dates = pd.read_csv(base_dir + "calendar_dates.txt")

        date_to_service_id_list = dict()

        for _, override_row in df_base_calendar.iterrows():
            service_id = override_row["service_id"]
            start_date = override_row["start_date"]
            end_date = override_row["end_date"]
            for date in pd.date_range(str(start_date), str(end_date)):
                date_format = date.strftime("%Y%m%d")
                if date_format not in date_to_service_id_list:
                    date_to_service_id_list[date_format] = []  # 初期化する
                # 曜日と合致すれば追加する
                if (
                    (date.weekday() == 0 and override_row["monday"] == 1)
                    or (date.weekday() == 1 and override_row["tuesday"] == 1)
                    or (date.weekday() == 2 and override_row["wednesday"] == 1)
                    or (date.weekday() == 3 and override_row["thursday"] == 1)
                    or (date.weekday() == 4 and override_row["friday"] == 1)
                    or (date.weekday() == 5 and override_row["saturday"] == 1)
                    or (date.weekday() == 6 and override_row["sunday"] == 1)
                ):
                    date_to_service_id_list[date_format].append(service_id)

        # override する
        for _, override_row in df_calendar_dates.iterrows():
            date = str(override_row["date"])
            service_id = override_row["service_id"]
            exception_type = override_row["exception_type"]
            if exception_type == 2:  # 「削除」のクエリだと考える
                if date in date_to_service_id_list:
                    if service_id in date_to_service_id_list[date]:
                        date_to_service_id_list[date].remove(service_id)
                    else:
                        warnings.warn(
                            "While trying to override service id from calendar_dates.txt, the service_id "
                            + str(service_id)
                            + "was not found in the date "
                            + str(date)
                            + "in calendar_dates.txt! This will be ignored.",
                            stacklevel=2,
                        )
                else:
                    warnings.warn(
                        "While trying to override service id from calendar_dates.txt, the date "
                        + str(date)
                        + " was not found in regular dates (calendar.txt)! Check calendar_dates.txt corresponds with calendar.txt. This will be ignored.",
                        stacklevel=2,
                    )
            elif exception_type == 1:  # 「追加」のクエリだと考える
                # if date in date_to_service_id_list:
                #     warnings.warn(
                #         "Duplicate date " +
                #         str(date) +
                #         "was found while reading calendar_dates.txt! Only the last one will be used."
                #     )
                date_to_service_id_list[date].append(service_id)
            else:
                warnings.warn(
                    "The date "
                    + str(date)
                    + " in calendar_dates.txt contains invalid exception_type"
                    + str(exception_type)
                    + " ! This will be ignored.",
                    stacklevel=2,
                )

        self.date_to_service_id = date_to_service_id_list

    # バス停idからバスの名前を取得する
    # 何もないときはNone、存在すればそれらを list で返す
    #   None | str | numpy.ndarray
    def get_stop_name(self, stop_id: str):
        ret = self.df_stops[self.df_stops["stop_id"] == stop_id]["stop_name"].values
        # numpy.ndarray 型
        if ret.shape[0] == 0:
            return None
        return list(ret)

    # バス停idからplatform_codeを取得する
    # 何もないときはNone、存在すればその値を文字列で返す
    def get_platform_code(self, stop_id: str):
        ret = self.df_stops[self.df_stops["stop_id"] == stop_id]["platform_code"].values
        # numpy.ndarray 型
        if ret.shape[0] == 0:
            raise KeyError("stop_id not found")
        # platform_code is optional in GTFS spec, might be NaN or empty string
        platform_code = ret[0]
        # Handle pandas NaN values and empty strings
        if pd.isna(platform_code) or platform_code == "":
            return None
        # If already a string, return as-is; if numeric, convert to int first to remove .0 from floats
        if isinstance(platform_code, str):
            return platform_code
        try:
            # may be comprehended as float, so convert to int first
            return str(int(platform_code))
        except (ValueError, TypeError):
            return str(platform_code)

    def get_agency_info(self):
        """Get agency information from agency.txt as a list of dicts.

        Returns:
            List of dictionaries containing agency information with known GTFS fields:
            - agency_id: Agency ID (converted to string)
            - agency_name: Agency name
            - agency_url: Agency URL
            - agency_timezone: IANA timezone name
            - agency_lang: Language code (required in GTFS-JP)
            - agency_phone: Phone number (optional)
            - agency_fare_url: Fare information URL (optional)
            - agency_email: Email address (optional, GTFS-JP standard)

        Note:
            Only known GTFS/GTFS-JP fields are returned. Any additional custom fields
            in the agency.txt file will be ignored. This ensures type safety and
            consistency with the Agency Pydantic model.

            Currently GTFS-JP data typically contains a single agency,
            but this returns a list for future multi-agency support.

        Raises:
            ValueError: If required fields are missing from agency.txt
        """
        if self.df_agency is None or self.df_agency.empty:
            return []

        # Define known GTFS agency fields that match our Pydantic model
        known_fields = {
            "agency_id",
            "agency_name",
            "agency_url",
            "agency_timezone",
            "agency_lang",
            "agency_phone",
            "agency_fare_url",
            "agency_email",
        }

        # Validate that all required fields are present in the DataFrame.
        # If any are missing, fail fast with a clear error instead of silently
        # constructing dicts that will later fail Pydantic validation.
        required_fields = {
            "agency_id",
            "agency_name",
            "agency_url",
            "agency_timezone",
            "agency_lang",
        }
        missing_required = required_fields - set(self.df_agency.columns)
        if missing_required:
            raise ValueError(
                f"Missing required GTFS agency fields in agency.txt: {sorted(missing_required)}"
            )

        # Convert DataFrame to list of dicts, replacing NaN with None
        agencies = []
        for _, row in self.df_agency.iterrows():
            agency_dict = {}
            for col in known_fields:
                if col not in self.df_agency.columns:
                    # Field not present in the data. At this point, this can only
                    # be an optional field because required fields are validated
                    # above. Treat missing optional columns as None.
                    agency_dict[col] = None
                    continue

                value = row[col]
                # Convert pandas NA/NaN to None, and convert numpy types to Python types
                if pd.isna(value):
                    agency_dict[col] = None
                elif isinstance(value, (np.integer, np.floating)):
                    # Convert numeric types to their Python equivalents, then to string
                    agency_dict[col] = str(value.item())
                else:
                    # Preserve empty strings and other values, only convert to string
                    agency_dict[col] = str(value)
            agencies.append(agency_dict)

        return agencies

    def get_same_name_stops(
        self, stop_id: str
    ) -> list[dict[str, str | float | None]]:
        """Get all stops with the same name as the given stop_id.

        This is used for platform switching (のりば切替) functionality to find
        other platforms at the same bus stop location.

        Args:
            stop_id: The stop ID to find same-name stops for.

        Returns:
            List of dicts with keys: stop_id, stop_name, platform_code, stop_lat, stop_lon.
            The list includes the original stop_id as well as other stops with the same name.

        Raises:
            KeyError: If stop_id is not found.
        """
        # First, get the stop name for the given stop_id
        matching_stop = self.df_stops[self.df_stops["stop_id"] == stop_id]
        if matching_stop.empty:
            raise KeyError(f"stop_id not found: {stop_id}")

        stop_name = matching_stop["stop_name"].values[0]

        # Find all stops with the same name
        same_name_stops = self.df_stops[self.df_stops["stop_name"] == stop_name]

        results = []
        for _, row in same_name_stops.iterrows():
            platform_code = row.get("platform_code")
            # Handle pandas NaN values and empty strings
            if pd.isna(platform_code) or platform_code == "":
                platform_code = None
            elif not isinstance(platform_code, str):
                try:
                    platform_code = str(int(platform_code))
                except (ValueError, TypeError):
                    platform_code = str(platform_code)

            results.append(
                {
                    "stop_id": row["stop_id"],
                    "stop_name": row["stop_name"],
                    "platform_code": platform_code,
                    "stop_lat": float(row["stop_lat"]),
                    "stop_lon": float(row["stop_lon"]),
                }
            )

        return results

    # バス停の名前からidに変換する
    #   None | DataFrame[{ "stop_id": str, "stop_name": str }]
    def get_stop_id(self, stop_name, exact=False):
        if exact:
            # Exact match: first try direct stop_name match
            ret = self.df_stops[self.df_stops["stop_name"] == stop_name][
                ["stop_id", "stop_name"]
            ]

            # If no results, check if the query matches a translation (e.g., hiragana)
            if ret.empty and stop_name in self._translation_to_stop_name:
                original_name = self._translation_to_stop_name[stop_name]
                ret = self.df_stops[self.df_stops["stop_name"] == original_name][
                    ["stop_id", "stop_name"]
                ]
        else:
            # Partial match: search in stop_name column (regex=False for literal string matching)
            ret = self.df_stops[
                self.df_stops["stop_name"].str.contains(stop_name, regex=False)
            ][["stop_id", "stop_name"]]

            # Also search for partial matches in translations
            # Only proceed if we have translations and the query is not empty
            if stop_name and self._translation_to_stop_name:
                # Find all original names where the translation contains the query
                matching_original_names = [
                    original_name
                    for translation, original_name in self._translation_to_stop_name.items()
                    if stop_name in translation
                ]

                if matching_original_names:
                    # Get stops that match these original names (but aren't already in ret)
                    translation_matches = self.df_stops[
                        self.df_stops["stop_name"].isin(matching_original_names)
                        & ~self.df_stops["stop_name"].str.contains(
                            stop_name, regex=False
                        )
                    ][["stop_id", "stop_name"]]

                    # Combine results
                    ret = pd.concat([ret, translation_matches], ignore_index=True)
                    # Remove duplicates based on stop_id
                    ret = ret.drop_duplicates(subset=["stop_id"])

        return ret

    # 2つをつなぐ路線IDのリストを取得
    # 修正: from -> to の順番でなければ受け付けない
    def get_trips_from_stops(self, from_id, to_id, service_id=None):
        """Get trip IDs connecting two stops.

        Args:
            from_id: Origin stop ID
            to_id: Destination stop ID
            service_id: Optional service ID to filter trips.
                       If None or empty string "", no service_id filtering is applied.

        Returns:
            List of trip IDs that connect the two stops in the specified order.
        """
        res = []

        # Use pre-built stop->trips index for O(1) lookup instead of DataFrame filter
        if from_id in self._stop_to_trips:
            candidates = self._stop_to_trips[from_id]
        else:
            # Fallback to DataFrame if cache miss
            candidates = list(
                self.df_stop_times[self.df_stop_times["stop_id"] == from_id][
                    "trip_id"
                ].values
            )

        # Filter by service_id using cached lookup
        # Note: treat empty string same as None (no filtering)
        if service_id is not None and service_id != "":
            candidates = [
                x for x in candidates if self.get_trip_service_id(x) == service_id
            ]

        for trip_id in candidates:
            # Use pre-built (trip_id, stop_id) -> times index for O(1) lookup
            from_key = (trip_id, from_id)
            to_key = (trip_id, to_id)

            # Check if trip stops at both from and to stops
            if from_key not in self._trip_stop_times:
                continue
            if to_key not in self._trip_stop_times:
                continue

            # Handle multiple visits to same stop (circular routes)
            # Check all combinations where from_stop comes before to_stop in sequence
            from_entries = self._trip_stop_times[from_key]
            to_entries = self._trip_stop_times[to_key]

            found_valid_sequence = False
            for _from_arr, _from_dep, from_seq in from_entries:
                for _to_arr, _to_dep, to_seq in to_entries:
                    if to_seq > from_seq:
                        found_valid_sequence = True
                        break
                if found_valid_sequence:
                    break

            if found_valid_sequence:
                res.append(trip_id)

        return res

    # ある路線を通じた出発、到着時間を取得
    # 注意！ trip_id は from -> to の順番で指定しないと、departure と arrival の順番が逆になることもある
    #   戻り値: tuple: (departure, arrival)
    #   07.25 修正: 逆の順番は受け付けない
    def get_trip_times(self, from_id, to_id, trip_id):
        # Use pre-built index for O(1) lookup instead of DataFrame filters
        from_key = (trip_id, from_id)
        to_key = (trip_id, to_id)

        # Check if trip exists using the cache (built from same data, so complete)
        if trip_id not in self._trip_to_service_id:
            raise ValueError("trip_id not found")

        # Get departure time and sequence from cache
        if from_key not in self._trip_stop_times:
            raise ValueError(
                "The trip " + trip_id + " does not involve a stop: " + from_id,
            )

        # Get arrival time from cache
        if to_key not in self._trip_stop_times:
            raise ValueError("The trip " + trip_id + " does not stop at: " + to_id)

        # Handle multiple visits to same stop (circular routes)
        # Find the first valid sequence where from_stop comes before to_stop
        from_entries = self._trip_stop_times[from_key]
        to_entries = self._trip_stop_times[to_key]

        dep_time = None
        arr_time = None

        for _from_arr, from_dep, from_seq in from_entries:
            for to_arr, _to_dep, to_seq in to_entries:
                if to_seq > from_seq:
                    # Found valid sequence - use first occurrence
                    dep_time = from_dep
                    arr_time = to_arr
                    break
            if dep_time is not None:
                break

        # Verify that a valid (from_seq, to_seq) pair was found
        if dep_time is None:
            raise ValueError(
                "The trip "
                + trip_id
                + " does not stop at "
                + to_id
                + " after the stop "
                + from_id,
            )

        return dep_time, arr_time

    # バス停の緯度経度を取得する
    def get_stop_lat_lon(self, stop_id):
        res = self.df_stops[self.df_stops["stop_id"] == stop_id][
            ["stop_lat", "stop_lon"]
        ]
        if res.shape[0] == 0:
            raise ValueError("stop_id not found")
        if res.shape[0] > 1:
            raise ValueError("stop_id is not unique")

        return res.values[0]

    # あるバス停間の route_id と fare id を取得する
    # 複数返る場合もある
    def get_fare_route_by_stops(self, from_id, to_id):
        fares_df = self.df_fare_id_route[
            (self.df_fare_id_route["origin_id"] == from_id)
            & (self.df_fare_id_route["destination_id"] == to_id)
        ][["route_id", "fare_id"]]
        if fares_df.shape[0] == 0:
            # 逆も試す
            fares_df = self.df_fare_id_route[
                (self.df_fare_id_route["origin_id"] == to_id)
                & (self.df_fare_id_route["destination_id"] == from_id)
            ][["route_id", "fare_id"]]
            if fares_df.shape[0] == 0:
                raise ValueError("origin or destination not found")
        #        if fares_df.shape[0] > 1:
        #            raise ValueError("origin and destination are not unique")

        return fares_df

    # fare id から 運賃を取得する
    def get_fare_from_id(self, fare_id):
        return self.df_fare_id_cost[self.df_fare_id_cost["fare_id"] == fare_id][
            "price"
        ].values[0]

    # あるバス停間の運賃を取得する
    def get_fare_from_stops(self, from_id, to_id) -> int:
        route_and_fares = self.get_fare_route_by_stops(from_id, to_id)
        return self.get_fare_from_id(route_and_fares["fare_id"].values[0]).item()

    def get_fares_bulk(self, from_id: str, to_ids: list[str]) -> dict[str, int | None]:
        """Get fares for multiple destination stops from a single origin.

        Args:
            from_id: Origin stop ID
            to_ids: List of destination stop IDs

        Returns:
            Dictionary mapping destination stop ID to fare amount (or None if not found)
        """
        if not to_ids:
            return {}

        # Query fare_rules for all destinations at once
        df_fare = self.df_fare_id_route
        matches = df_fare[
            (df_fare["origin_id"] == from_id) & (df_fare["destination_id"].isin(to_ids))
        ]

        # Reverse direction fallback
        reverse_matches = df_fare[
            (df_fare["origin_id"].isin(to_ids)) & (df_fare["destination_id"] == from_id)
        ]

        # Merge results (forward takes precedence)
        fare_ids = {}
        for _, row in reverse_matches.iterrows():
            fare_ids[row["origin_id"]] = row["fare_id"]
        for _, row in matches.iterrows():
            fare_ids[row["destination_id"]] = row["fare_id"]

        # Bulk lookup fare amounts
        result: dict[str, int | None] = {}
        if fare_ids:
            df_fares = self.df_fare_id_cost[
                self.df_fare_id_cost["fare_id"].isin(list(fare_ids.values()))
            ]
            fare_prices = dict(zip(df_fares["fare_id"], df_fares["price"], strict=True))

            for to_id in to_ids:
                fare_id = fare_ids.get(to_id)
                if fare_id is not None and fare_id in fare_prices:
                    result[to_id] = int(fare_prices[fare_id])
                else:
                    result[to_id] = None
        else:
            result = {to_id: None for to_id in to_ids}

        return result

    # 経路を検索する ("乗り換えるべきバス停" が出る)
    # NetworkXNoPath: 経路が見つからない場合

    def get_shortest_path(self, from_id, to_id, service_id=None):
        if service_id is None:
            path = nx.shortest_path(self.graph, source=from_id, target=to_id)
        else:
            path = nx.shortest_path(
                self.graph_via_service_id[service_id],
                source=from_id,
                target=to_id,
            )

        return path

    # path (バス停IDのlist) から、それらを通るすべての経路IDを取得する
    # trip_id はlistになることに注意
    def get_travels_from_path(self, path, service_id=None) -> list[TravelOnce]:
        prev_stop = None
        travel_list = []

        for current_stop in path:
            if prev_stop is None:
                prev_stop = current_stop
                continue

            # Check if this is a walk transfer (same-name stops)
            if self.is_walk_transfer(prev_stop, current_stop):
                travel_list.append(
                    TravelOnce(
                        trip_id=WALK_TRANSFER_TRIP_ID,
                        fare=0,
                        arrival_time=None,
                        departure_time=None,
                        from_stop_id=prev_stop,
                        to_stop_id=current_stop,
                        is_walk_transfer=True,
                    ),
                )
                prev_stop = current_stop
                continue

            # find trips that go from the previous stop to the current stop
            trips = self.get_trips_from_stops(prev_stop, current_stop, service_id)
            travel_list.append(
                TravelOnce(
                    trip_id=trips,
                    fare=self.get_fare_from_stops(prev_stop, current_stop),
                    arrival_time=None,
                    departure_time=None,
                    from_stop_id=prev_stop,
                    to_stop_id=current_stop,
                    is_walk_transfer=False,
                ),
            )
            prev_stop = current_stop

        return travel_list

    # path (バス停IDのlist) と service_id, begin_time から、それらを通るすべての経路IDを取得する
    # begin_time 以降で最速のひとつのみが trip_id として入る
    # 注意: 日を越すことはできない
    def get_timed_travels_from_path(
        self,
        path: list[str],
        service_id: str,
        begin_time: np.datetime64,
        change_time: np.timedelta64 | None = None,
    ) -> list[TravelOnce]:
        if change_time is None:
            change_time = np.timedelta64(0, "m")

        # Validate that begin_time is not None
        if begin_time is None:
            raise ValueError("begin_time cannot be None")

        cur_time = begin_time
        prev_stop = None
        travel_list = []
        # Track indices of initial walk transfers that need time backfill
        initial_walk_transfer_indices: list[int] = []
        found_first_bus = False

        for current_stop in path:
            if prev_stop is None:
                prev_stop = current_stop
                continue

            logger.info("@ %s %s -> %s", cur_time, prev_stop, current_stop)

            # Check if this is a walk transfer (same-name stops)
            if self.is_walk_transfer(prev_stop, current_stop):
                logger.info("Walk transfer detected: %s -> %s", prev_stop, current_stop)
                # Walk transfers are instant - no trip needed, no fare
                # For initial walk transfers (before first bus), use placeholder times
                # that will be backfilled once we find the first bus departure
                travel_list.append(
                    TravelOnce(
                        trip_id=WALK_TRANSFER_TRIP_ID,
                        arrival_time=cur_time,
                        departure_time=cur_time,
                        fare=0,
                        from_stop_id=prev_stop,
                        to_stop_id=current_stop,
                        is_walk_transfer=True,
                    ),
                )
                # Track initial walk transfers for time backfill
                if not found_first_bus:
                    initial_walk_transfer_indices.append(len(travel_list) - 1)
                # cur_time stays the same for walk transfers
                prev_stop = current_stop
                continue

            # Validate that cur_time is not None before using it
            # This should never happen as begin_time is validated and arr_time is validated
            # but we check defensively to prevent TypeError
            if cur_time is None:
                logger.error(
                    "Current time is None at stop %s - this indicates a data integrity issue",
                    prev_stop,
                )
                raise ValueError(
                    f"Unexpected None value for current time at stop {prev_stop}. "
                    "This may indicate data corruption in the GTFS data."
                )

            candidate_trips = dict()
            for target_trip in self.get_trips_from_stops(
                prev_stop,
                current_stop,
                service_id,
            ):
                dep_time, arr_time = self.get_trip_times(
                    prev_stop,
                    current_stop,
                    target_trip,
                )
                if dep_time >= cur_time + change_time:
                    candidate_trips[target_trip] = arr_time
            if len(candidate_trips.keys()) == 0:
                # Return empty list instead of raising error when no trips are available
                logger.info(
                    "No trip found with departure time after %s at stop %s to stop %s",
                    cur_time,
                    prev_stop,
                    current_stop,
                )
                return []
            fastest_trip = min(candidate_trips, key=candidate_trips.get)
            dep_time, arr_time = self.get_trip_times(
                prev_stop,
                current_stop,
                fastest_trip,
            )
            logger.info(
                "fastest via %s dep %s arr %s",
                fastest_trip,
                dep_time,
                arr_time,
            )

            # Validate that arr_time is not None before using it
            # If arr_time is None, this is a fatal data integrity error
            if arr_time is None:
                logger.error(
                    "Arrival time is None for trip %s - this indicates invalid GTFS data",
                    fastest_trip,
                )
                raise ValueError(
                    f"Arrival time is None for trip {fastest_trip} at stop {current_stop}. "
                    "This indicates invalid or corrupted GTFS data and the request cannot be fulfilled."
                )

            travel_list.append(
                TravelOnce(
                    trip_id=fastest_trip,
                    arrival_time=arr_time,
                    departure_time=dep_time,
                    fare=self.get_fare_from_stops(prev_stop, current_stop),
                    from_stop_id=prev_stop,
                    to_stop_id=current_stop,
                    is_walk_transfer=False,
                ),
            )

            # Backfill initial walk transfer times to match first bus departure
            if not found_first_bus and initial_walk_transfer_indices:
                logger.info(
                    "Backfilling %d initial walk transfer(s) with departure time %s",
                    len(initial_walk_transfer_indices),
                    dep_time,
                )
                for idx in initial_walk_transfer_indices:
                    old_travel = travel_list[idx]
                    travel_list[idx] = TravelOnce(
                        trip_id=old_travel.trip_id,
                        arrival_time=dep_time,
                        departure_time=dep_time,
                        fare=old_travel.fare,
                        from_stop_id=old_travel.from_stop_id,
                        to_stop_id=old_travel.to_stop_id,
                        is_walk_transfer=old_travel.is_walk_transfer,
                    )
                initial_walk_transfer_indices.clear()

            found_first_bus = True
            cur_time = arr_time
            prev_stop = current_stop
        return travel_list

    # あるバス停を通るすべての trip を取得する
    #   service_id を指定するとフィルタリングが可能
    #   --> list
    def get_trips_from_stop(self, stop_id, service_id=None):
        trips_filtered = self.df_stop_times[self.df_stop_times["stop_id"] == stop_id][
            "trip_id"
        ]
        if service_id is None:
            res = list(trips_filtered)
        else:
            res = []
            for row in trips_filtered:
                if self.get_trip_service_id(row) == service_id:
                    res.append(row)
        if len(res) == 0:
            raise ValueError("no stop with given id found")
        return res

    # trip が stop_id と合致するバス停を通る時間を取得する
    #   --> dict{"trip_id": str, "arrival_time": str, "departure_time": str}
    def get_time_from_trip_and_stop(self, trip_id, stop_id):
        res = self.df_stop_times[
            (self.df_stop_times["trip_id"] == trip_id)
            & (self.df_stop_times["stop_id"] == stop_id)
        ][["trip_id", "arrival_time", "departure_time"]]

        if res.shape[0] == 0:
            trip_res = self.df_stop_times[self.df_stop_times["trip_id"] == trip_id]
            stop_res = self.df_stop_times[self.df_stop_times["stop_id"] == stop_id]
            if trip_res.shape[0] == 0:
                if stop_res.shape[0] == 0:
                    raise ValueError(
                        "No trip with given trip_id found and no stop with give stop_id found",
                    )
                raise ValueError(
                    "A stop with given stop_id was found, but no trip with given trip_id found",
                )
            if stop_res.shape[0] == 0:
                raise ValueError(
                    "A trip with given trip_id was found, but no stop with given stop_id found",
                )
            raise ValueError(
                "Given valid trip_id and stop_id, but no trip with the specified combination found",
            )
        return {
            "trip_id": res["trip_id"].values[0],
            "arrival_time": res["arrival_time"].values[0],
            "departure_time": res["departure_time"].values[0],
        }

    # trip と stop_id からその trip のゆくバス停について、それらへの運賃や到着時間を取得する
    # TODO: 要命名
    def get_trip_journey(self, trip_id, from_stop_id) -> pd.DataFrame:
        trip_stops = self.get_stops_from_trip(trip_id)["stop_id"]
        trip_stops_set = set(trip_stops)

        # Find effective origin: if from_stop_id is not on the trip,
        # check if a same-name stop (walk transfer) is on the trip
        effective_origin = from_stop_id
        if from_stop_id not in trip_stops_set:
            # Check same-name stops (connected via walk transfer)
            same_name_stops_data = self.get_same_name_stops(from_stop_id)
            same_name_stop_ids = [stop["stop_id"] for stop in same_name_stops_data]
            for candidate_stop in same_name_stop_ids:
                if candidate_stop in trip_stops_set:
                    effective_origin = candidate_stop
                    break

            # If no same-name stop is found on the trip, raise an error
            if effective_origin == from_stop_id:
                same_name_list = ", ".join(same_name_stop_ids)
                raise ValueError(
                    f"Stop {from_stop_id} and its same-name variants [{same_name_list}] "
                    f"are not on trip {trip_id}. "
                    f"Please select a stop that is on this trip's route."
                )

        stops_list = []
        fare_list = []
        arrival_time_list = []
        departure_time_list = []

        for dest_stop_id in trip_stops:
            if dest_stop_id == effective_origin:
                fare = 0  # 同じバス停なら0円
            else:
                fare = self.get_fare_from_stops(effective_origin, dest_stop_id)
            time_df = self.get_time_from_trip_and_stop(trip_id, dest_stop_id)
            arrival_time = time_df["arrival_time"]
            departure_time = time_df["departure_time"]
            stops_list.append(dest_stop_id)
            fare_list.append(fare)
            arrival_time_list.append(arrival_time)
            departure_time_list.append(departure_time)

        return pd.DataFrame(
            {
                "trip_id": trip_id,
                "fare": fare_list,
                "arrival_time": arrival_time_list,
                "departure_time": departure_time_list,
                "stop_id": stops_list,
            },
        )

    # trip_id から service_id を得る
    def get_trip_service_id(self, trip_id):
        # Use pre-built cache for O(1) lookup instead of DataFrame filter
        if trip_id in self._trip_to_service_id:
            return self._trip_to_service_id[trip_id]
        # Fallback to DataFrame lookup if cache miss (shouldn't happen after initialize)
        sid_series = self.df_trips[self.df_trips["trip_id"] == trip_id]["service_id"]
        if sid_series.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return sid_series.values[0]

    # trip_id の止まるすべてのバス停と時刻、順番を取得
    def get_stops_from_trip(self, trip_id):
        res = self.df_stop_times[self.df_stop_times["trip_id"] == trip_id][
            [
                "trip_id",
                "arrival_time",
                "departure_time",
                "stop_id",
                "stop_sequence",
                "stop_headsign",
            ]
        ]
        if res.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return res

    # trip の終着駅のidを取得 (注意: 行き先表示板ではない！)
    def get_destination_id_from_trip(self, trip_id) -> str:
        df_stop = self.get_stops_from_trip(trip_id)
        max_seq = max(df_stop["stop_sequence"].values.tolist())
        # return the stop_id for the row with the maximum sequence
        res = df_stop[df_stop["stop_sequence"] == max_seq]["stop_id"].values[0]
        return str(res)

    # route_id に関連する情報をぜんぶ取得する
    def get_route_info(self, route_id):
        # Convert route_id to match dataframe type (may be string or int)
        try:
            route_id_lookup = int(route_id)
        except (ValueError, TypeError):
            route_id_lookup = route_id

        df_matching_trips = self.df_trips[self.df_trips["route_id"] == route_id_lookup]
        if df_matching_trips.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return df_matching_trips

    # trip_id から route_id に変換 (注意: 上り下りなどのサフィックスを消去しない)
    def get_route_id_from_trip(self, trip_id):
        df_matching_trips = self.df_trips[self.df_trips["trip_id"] == trip_id]
        if df_matching_trips.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return df_matching_trips["route_id"].values[0]

    # route_id の行き先を取得 (注意: バス停の名前ではない！)
    def get_destination_display_name_from_route(self, route_id):
        df_matching_routes = self.get_route_info(route_id)
        if df_matching_routes.shape[0] == 0:
            raise ValueError("No route with give route_id found")
        value = df_matching_routes["trip_headsign"].values[0]
        # Convert pandas NaN to None, then fallback to route_long_name if empty
        if pd.isna(value) or str(value).strip() == "":
            # Fallback to route_long_name from routes table
            # Convert route_id to match dataframe type (may be string or int)
            try:
                route_id_lookup = int(route_id)
            except (ValueError, TypeError):
                route_id_lookup = route_id

            route_info = self.df_routes[self.df_routes["route_id"] == route_id_lookup]
            if route_info.shape[0] > 0:
                route_name = route_info["route_long_name"].values[0]
                return None if pd.isna(route_name) else str(route_name)
            return None
        return str(value)

    # route_id に対応する service id を取得
    def get_service_id_from_route(self, route_id):
        return self.get_route_info(route_id)["service_id"].values[0]

    # route_id に対応する短縮名(「なんとか線」を取得)
    def get_route_name_from_route(self, route_id):
        # Convert route_id to match dataframe type (may be string or int)
        try:
            # Try as int if possible (for numeric route IDs)
            route_id_lookup = int(route_id)
        except (ValueError, TypeError):
            # Keep as string if not numeric
            route_id_lookup = route_id

        value = self.df_routes[self.df_routes["route_id"] == route_id_lookup][
            "route_long_name"
        ].values[0]
        # Convert pandas NaN to None for Pydantic compatibility
        return None if pd.isna(value) else str(value)

    def get_nearby_stops(
        self,
        lat: float,
        lon: float,
        limit: int = 10,
    ) -> list[NearbyStopResult]:
        """Get nearby bus stops sorted by distance from given coordinates.

        Args:
            lat: Latitude in decimal degrees
            lon: Longitude in decimal degrees
            limit: Maximum number of stops to return (default: 10)

        Returns:
            List of NearbyStopResult dataclasses sorted by distance from nearest to farthest
        """
        if limit <= 0:
            raise ValueError("limit must be positive")
        # Use batch calculation for better performance with large datasets
        distances = self.distance_calculator.calculate_distances_batch(
            lat,
            lon,
            self.df_stops,
        )
        # Extract data as numpy arrays for better performance than iterrows()
        stop_ids = self.df_stops["stop_id"].values
        stop_names = self.df_stops[
            "stop_name"
        ].values  # stop_name is required in GTFS spec
        stop_lats = self.df_stops["stop_lat"].values.astype(float)
        stop_lons = self.df_stops["stop_lon"].values.astype(float)
        # Create result objects using array indexing
        results = [
            NearbyStopResult(
                stop_id=stop_ids[i],
                stop_name=stop_names[i],
                distance_km=distances[i],
                stop_lat=stop_lats[i],
                stop_lon=stop_lons[i],
            )
            for i in range(len(distances))
        ]
        # Sort by distance and return only the requested limit
        results.sort(key=lambda x: x.distance_km)
        return results[:limit]
