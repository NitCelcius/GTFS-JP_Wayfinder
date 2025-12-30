# gtfs-jp-wayfinder

GTFS-JP transit routing API with FastAPI backend.

## Development

### Graph Caching for Faster Development

By default, the API regenerates the route graph from GTFS data on every restart. This can be slow during development with hot-reload enabled. To speed up development, you can enable graph caching:

#### Enable Caching

```bash
# Run with caching enabled
pnpm dev:cache

# Or set the environment variable manually
CACHE_GRAPH=true pnpm dev
```

#### How it Works

When caching is enabled:
- On first startup, the API generates the graph and saves it to `.graph_cache.pkl` in the data directory
- On subsequent restarts, the API loads the cached graph if it exists and is valid
- The cache is automatically invalidated if any GTFS data files are modified

#### Important Notes

- **Cache invalidation**: The cache is validated against the modification time of GTFS data files (`stops.txt`, `stop_times.txt`, `trips.txt`, `calendar.txt`, `calendar_dates.txt`). If any of these files change, the cache is automatically regenerated.
- **Development only**: Graph caching is intended for development mode with `--reload`. In production, you typically don't restart the server frequently, so caching provides less benefit.
- **Graph changes**: If you modify the graph generation logic in the code, you should delete the cache file manually or disable caching to ensure your changes take effect.

#### Disabling Caching

```bash
# Default behavior - no caching
pnpm dev

# Or explicitly disable
CACHE_GRAPH=false pnpm dev
```

To clear the cache manually:
```bash
rm data/gtfs-akita-chuo-kotsu/.graph_cache.pkl
```
