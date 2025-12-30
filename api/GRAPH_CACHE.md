# Graph Caching Feature

## Overview

This feature adds graph caching to speed up development mode restarts. When enabled, the API saves the generated NetworkX graphs to disk after the first initialization and loads them on subsequent restarts, significantly reducing startup time.

## Quick Start

### Enable caching for development:
```bash
cd api
pnpm dev:cache
```

### Or use the environment variable:
```bash
CACHE_GRAPH=true pnpm dev
```

## How It Works

### Cache Creation
1. When `CACHE_GRAPH=true`, the API checks for a cache file at `data/gtfs-akita-chuo-kotsu/.graph_cache.pkl`
2. If no cache exists, it generates the graph normally and saves it to the cache file
3. The cache includes:
   - Main routing graph (`self.graph`)
   - Per-service graphs (`self.graph_via_service_id`)
   - Calendar data (`self.date_to_service_id`)
   - Timestamp of GTFS data files for validation

### Cache Loading
1. On subsequent startups, the API loads the cache file
2. It validates the cache by comparing GTFS data file modification times
3. If data has changed, the cache is automatically invalidated and regenerated
4. If valid, the cached graphs are loaded, skipping the expensive generation step

### Cache Invalidation
The cache is automatically invalidated when any of these files change:
- `stops.txt`
- `stop_times.txt`
- `trips.txt`
- `calendar.txt`
- `calendar_dates.txt`

## Performance Impact

Typical startup times:
- **Without caching**: 5-15 seconds (depends on GTFS data size)
- **With valid cache**: 1-3 seconds
- **Speedup**: 3-5x faster startup

This is especially useful with uvicorn's `--reload` flag in development, where the server restarts on code changes.

## Configuration

### Environment Variable
- `CACHE_GRAPH`: Set to `true`, `1`, or `yes` to enable caching
- Default: `false` (caching disabled)

### Package Scripts
- `pnpm dev`: Run without caching (default)
- `pnpm dev:cache`: Run with caching enabled
- `pnpm dev:network`: Run network debug mode (no caching by default)

## Important Notes

### When to Use Caching
✅ **USE caching when:**
- Developing with hot-reload enabled
- Working on non-graph-related features
- GTFS data is stable and unchanged

❌ **DON'T use caching when:**
- Modifying graph generation logic
- Testing changes to routing algorithms
- Working with frequently changing GTFS data

### Manual Cache Clearing
If you need to force cache regeneration:
```bash
rm api/data/gtfs-akita-chuo-kotsu/.graph_cache.pkl
```

Or simply disable caching temporarily:
```bash
CACHE_GRAPH=false pnpm dev
```

### Cache Location
- Cache file: `data/gtfs-akita-chuo-kotsu/.graph_cache.pkl`
- Added to `.gitignore` (not committed to repository)
- Safe to delete at any time

## Technical Details

### Implementation
- **Storage**: Python `pickle` with highest protocol
- **Validation**: Modification time comparison of GTFS files
- **Thread-safety**: Handled by existing singleton pattern in `wayfinder.py`
- **Error handling**: Graceful fallback to full regeneration on cache errors

### Files Modified
1. `database.py`: Added cache save/load methods
2. `main.py`: Added environment variable handling
3. `wayfinder.py`: Updated to pass cache parameter
4. `wayfinder_adapter.py`: Updated to pass cache parameter
5. `package.json`: Added `dev:cache` script
6. `.gitignore`: Added cache file pattern

### Testing
- Unit tests: `tests/test_graph_cache.py`
- Manual test: `tests/manual_test_cache.py`

## Troubleshooting

### Cache not being used
1. Check that `CACHE_GRAPH=true` is set
2. Verify the data directory path is correct
3. Look for "Graph caching is ENABLED" in logs

### Cache invalidation issues
- The cache automatically invalidates when GTFS files change
- If you suspect stale data, delete the cache file manually
- Check file modification times are being updated correctly

### Slow cache loading
- Cache files can be large (10-100MB depending on data size)
- Ensure adequate disk I/O performance
- Consider SSD for development environment

## Future Improvements

Potential enhancements:
- Compress cache files (gzip)
- Add cache versioning for code changes
- Support multiple cache files for different configurations
- Add cache metrics/stats logging
