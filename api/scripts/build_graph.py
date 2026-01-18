#!/usr/bin/env python3
"""Build-time script to fetch GTFS data and pre-generate graph for serverless deployment.

This script is designed to run during the Vercel build phase. It:
1. Uses local GTFS data from api/data/gtfs-akita-chuo-kotsu by default
2. OR downloads GTFS data from GTFS_DATA_URL environment variable if set
3. Unzips the data to a temporary location (if downloaded)
4. Initializes AkitaBusWayFinder and generates the routing graph
5. Serializes the complete state to a pickle file for fast runtime loading

Usage:
    # Use local data (default)
    python build_graph.py

    # Or download from URL
    GTFS_DATA_URL=https://example.com/gtfs.zip python build_graph.py

The output file (prebuilt_graph.pkl) should be bundled with the serverless function.
"""

import logging
import os
import pickle
import sys
import tempfile
import zipfile
from pathlib import Path
from urllib.request import urlretrieve

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from gtfs_jp_wayfinder.database import AkitaBusWayFinder

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Output path for the pre-built graph (relative to api/ directory)
OUTPUT_PATH = (
    Path(__file__).parent.parent / "src" / "gtfs_jp_wayfinder" / "prebuilt_graph.pkl"
)

# Default local GTFS data directory (relative to api/ directory)
DEFAULT_GTFS_DIR = Path(__file__).parent.parent / "data" / "gtfs-akita-chuo-kotsu"


def download_and_extract_gtfs(gtfs_url: str, extract_dir: str) -> str:
    """Download GTFS zip and extract to directory.

    Args:
        gtfs_url: URL to download GTFS zip file from
        extract_dir: Directory to extract files to

    Returns:
        Path to the extracted GTFS data directory (with trailing slash)
    """
    logger.info(f"Downloading GTFS data from: {gtfs_url}")

    zip_path = os.path.join(extract_dir, "gtfs.zip")
    urlretrieve(gtfs_url, zip_path)

    logger.info(f"Downloaded to: {zip_path}")

    # Extract the zip file
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_dir)

    logger.info(f"Extracted to: {extract_dir}")

    # Check if files are in a subdirectory or directly in extract_dir
    # GTFS zips sometimes have a folder inside
    txt_files = list(Path(extract_dir).glob("*.txt"))
    if txt_files:
        return extract_dir + "/"

    # Check for subdirectory
    subdirs = [d for d in Path(extract_dir).iterdir() if d.is_dir()]
    for subdir in subdirs:
        if list(subdir.glob("*.txt")):
            return str(subdir) + "/"

    raise FileNotFoundError(f"No GTFS txt files found in {extract_dir}")


def build_graph(gtfs_dir: str) -> AkitaBusWayFinder:
    """Initialize AkitaBusWayFinder and build the routing graph.

    Args:
        gtfs_dir: Path to directory containing GTFS txt files (with trailing slash)

    Returns:
        Initialized AkitaBusWayFinder instance with graph built
    """
    logger.info(f"Building graph from GTFS data in: {gtfs_dir}")

    wf = AkitaBusWayFinder()
    wf.initialize(gtfs_dir, use_cache_graph=False)

    logger.info("Graph built successfully")
    return wf


def serialize_wayfinder(wf: AkitaBusWayFinder, output_path: Path) -> None:
    """Serialize the complete wayfinder state to a pickle file.

    Args:
        wf: Initialized AkitaBusWayFinder instance
        output_path: Path to write the pickle file
    """
    logger.info(f"Serializing wayfinder state to: {output_path}")

    # Serialize the complete state needed for runtime
    state = {
        "df_stops": wf.df_stops,
        "df_stop_times": wf.df_stop_times,
        "df_fare_id_route": wf.df_fare_id_route,
        "df_fare_id_cost": wf.df_fare_id_cost,
        "df_trips": wf.df_trips,
        "df_routes": wf.df_routes,
        "df_agency": wf.df_agency,
        "date_to_service_id": wf.date_to_service_id,
        "graph": wf.graph,
        "graph_via_service_id": wf.graph_via_service_id,
        "agency_timezone": wf.agency_timezone,
        "default_date": wf.default_date,
        "_walk_transfer_pairs": wf._walk_transfer_pairs,
        "_trip_to_service_id": wf._trip_to_service_id,
        "_stop_to_trips": wf._stop_to_trips,
        "_trip_stop_times": wf._trip_stop_times,
    }

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "wb") as f:
        pickle.dump(state, f, protocol=pickle.HIGHEST_PROTOCOL)

    # Log file size
    size_mb = output_path.stat().st_size / (1024 * 1024)
    logger.info(f"Serialized state saved: {size_mb:.2f} MB")


def main():
    """Main entry point for build-time graph generation."""
    gtfs_url = os.environ.get("GTFS_DATA_URL")

    logger.info("=" * 60)
    logger.info("GTFS Graph Builder for Serverless Deployment")
    logger.info("=" * 60)

    if gtfs_url:
        # Download and extract GTFS data from URL
        logger.info(f"Using remote GTFS data from: {gtfs_url}")
        with tempfile.TemporaryDirectory() as tmpdir:
            gtfs_dir = download_and_extract_gtfs(gtfs_url, tmpdir)
            wf = build_graph(gtfs_dir)
            serialize_wayfinder(wf, OUTPUT_PATH)
    else:
        # Use local GTFS data directory
        if not DEFAULT_GTFS_DIR.exists():
            logger.error(f"Default GTFS data directory not found: {DEFAULT_GTFS_DIR}")
            logger.error("Either:")
            logger.error(f"  1. Ensure {DEFAULT_GTFS_DIR} exists with GTFS txt files")
            logger.error(
                "  2. Set GTFS_DATA_URL environment variable to download from URL"
            )
            sys.exit(1)

        logger.info(f"Using local GTFS data from: {DEFAULT_GTFS_DIR}")
        gtfs_dir = str(DEFAULT_GTFS_DIR) + "/"
        wf = build_graph(gtfs_dir)
        serialize_wayfinder(wf, OUTPUT_PATH)

    logger.info("=" * 60)
    logger.info("Build completed successfully!")
    logger.info(f"Output: {OUTPUT_PATH}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
