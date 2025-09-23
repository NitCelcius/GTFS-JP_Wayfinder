## Quick context (what this repo is)

- Monorepo with two main workspaces: `api/` (Python FastAPI service) and `web/` (Next.js app). See `pnpm-workspace.yaml` and root `package.json` (uses Turbo).
- `data/gtfs-akita-chuo-kotsu/` contains GTFS CSVs used by the API. The API loads these at startup (heavy I/O & memory).

## Tool Setup (IMPORTANT - Read First)

This project uses [mise](https://mise.jdx.dev/) to manage development tools for consistent versions across environments. Before running any development commands:

1. **Install mise** (if not already installed):
   ```bash
   # macOS: brew install mise
   # Linux/WSL: curl https://mise.run | sh
   # Or: cargo install mise
   ```

2. **Install project tools**:
   ```bash
   mise install  # Installs pnpm@10.14.0 and uv@0.8.20 from mise.toml
   ```

3. **Use mise exec for all commands** to ensure correct tool versions:
   ```bash
   mise exec pnpm install    # Install dependencies  
   mise exec pnpm dev        # Start development
   ```

For detailed setup instructions, see `CONTRIBUTING.md`.

## What an AI agent should know first

- The API is in `api/src/gtfs_jp_wayfinder/` — key files: `main.py`, `database.py`, `busloc_grabber.py`, `busstop_grabber.py`.
  - `main.py` constructs FastAPI app and calls `AkitaBusWayFinder.initialize("./data/gtfs-akita-chuo-kotsu/")` during startup (see lifespan/context manager).
  - `database.py` contains `AkitaBusWayFinder` and `TravelOnce`; it reads GTFS CSVs with pandas and builds NetworkX graphs (`generate_graph`) and a date->service_id map (`generate_calendar`). Many functions return numpy datetime64 and expect conversion via `np_datetime_truncate_to_str`.

- The web frontend lives in `web/`, generated OpenAPI client under `web/src/api/`, and `openapi.json` sits at `web/openapi.json`. An OpenAPI generation script exists at `scripts/generate-openapi.js`.

## Dev / run commands (how maintainers run the project)

**Important**: This project uses [mise](https://mise.jdx.dev/) to manage development tools. Always use `mise install` first to install the correct versions of pnpm and uv, then use `mise exec` to run commands.

- **Tool installation**: `mise install` (installs pnpm@10.14.0 and uv@0.8.20 from mise.toml)

- Root (recommended workspace orchestration): Root scripts (uses turbo):

  - `mise exec pnpm dev` -> runs turbo run dev (starts both workspaces if configured)
  - `mise exec pnpm build`
  - `mise exec pnpm test`

- API service (local development):

  - From workspace root: `mise exec pnpm --filter api dev` (pnpm workspace filter) or `cd api && mise exec pnpm dev`
  - The package.json in `api/` runs `uv run python -m uvicorn src.gtfs_jp_wayfinder.main:app --host 0.0.0.0 --port 8002` (uv is managed by mise).
  - Important: the API expects the GTFS CSV directory to be at `./data/gtfs-akita-chuo-kotsu/` relative to the process cwd. Starting the API from the repo root (or adjusting the path) is required.

- Web frontend:

  - `cd web && mise exec pnpm dev` (Next.js dev server, uses turbopack flag in package.json)

- Docker/composition: a root `docker-compose.yml` references `api` and `web` compose files. Use Docker Compose for containerized runs.

## Tests & lint

- API tests: `cd api && mise exec pnpm test` (package.json maps to `uv run pytest`). Alternatively run `mise exec uv run pytest` inside the project root.
- Lint: `cd api && mise exec pnpm run lint` (runs `ruff` via `uv`). `pyproject.toml` contains the ruff config and ignored rules — preserve those when editing linter settings.

## Patterns and conventions specific to this repo

- Heavy use of numpy datetime64 for stop times. Converters are in `AkitaBusWayFinder.time_str_to_np_datetime` and `np_datetime_truncate_to_str` — prefer using these helpers when converting in code to avoid format mismatches.
- Graph-based route model: `generate_graph()` builds a directed NetworkX graph of stops (and per-service graphs in `graph_via_service_id`). For routing logic, prefer using the existing `get_shortest_path`, `get_travels_from_path`, and `get_timed_travels_from_path` helpers.
- Data is loaded eagerly in `initialize()`. The FastAPI lifespan currently awaits initialization (blocking startup). Comments in `main.py` explicitly discuss switching to background initialization if needed.
- The repo uses `uv` as a small orchestration wrapper in npm scripts (see `api/package.json`) — scripts invoke `uv run ...`. When troubleshooting, inspect `api/package.json` and `pyproject.toml` for exact dev commands and Python version constraints.

## Integration & cross-component notes

- OpenAPI: `web/openapi.json` and the generated TypeScript client in `web/src/api/` are the contract between API and frontend. If you change API models, run `mise exec node ./scripts/generate-openapi.js` to update the client.
- External services: `busloc_grabber` pulls live bus GPS data from `https://akita.bustei.net/buslocation/IchigoMap.txt` — network calls are simple `requests.get`. Consider stubbing `requests` in tests or using recorded fixtures.

## Common gotchas discovered in repo scan

- CWD & data path: `main.py` calls wf.initialize("./data/gtfs-akita-chuo-kotsu/") — running the API from a different cwd will fail to find the GTFS CSVs. Use absolute paths or start the process from the repo root.
- Blocking initialization: startup currently awaits full CSV loading. This can make dev server slow to start. The code has a commented option to create a background task instead — be careful if changing lifecycle behavior.
- CORS list contains a concatenated string (likely accidental): look at `app.add_middleware(... allow_origins=[ ..., "http://127.0.0.1:5500http://127.0.0.1:80http://127.0.0.1:8002", ...])` in `api/src/gtfs_jp_wayfinder/main.py` — this is probably a bug and will not match expected origins.
- Python version: `pyproject.toml` declares requires-python = ">= 3.13". You can use mise to install Python 3.13+ (`mise use python@3.13`) or confirm CI/dev machines meet that (3.13+). If not, use a virtual env that matches.

## Where to look for source of truth and quick examples

- API endpoints and Pydantic models: `api/src/gtfs_jp_wayfinder/main.py` (many annotated Pydantic models used as responses). Use these types when changing behavior.
- Routing & domain logic: `api/src/gtfs_jp_wayfinder/database.py` (graph generation, calendar mapping, fare lookup).
- GTFS sample data: `data/gtfs-akita-chuo-kotsu/` (CSV files like `stops.txt`, `stop_times.txt`, etc.).

If anything above is unclear or you'd like me to add automated checks/tasks (CI job examples, a Makefile, or a short dev README), tell me which area to expand and I'll update this file.

For detailed development setup instructions, see `CONTRIBUTING.md` which explains how to use mise for tool management.

# When creating a mock

When creating mocks, assume the app serves for the following city:

## Bus stops

1.  **中央公園**
2.  **市役所前**
3.  **青葉台**
4.  **さくら通り**
5.  **緑が丘**
6.  **東駅**
7.  **西口**
8.  **南町**
9.  **北高前**
10. **大学病院**
11. **あきた芸術劇場ミルハス・にぎわい交流館 AU 前**

# Lines

## 都心循環線

- **名前**: 都心循環線
- **系統番号**: 001
- **つなぐバス停の一覧**: 東駅, 市役所前, 中央公園, 西口, 南町, 東駅

## 青葉台線

- **名前**: 青葉台線
- **系統番号**: 002
- **つなぐバス停の一覧**: 東駅, さくら通り, 青葉台, 緑が丘

## 文教医療線

- **名前**: 文教医療線
- **系統番号**: 003
- **つなぐバス停の一覧**: 西口, 北高前, 大学病院, あきた芸術劇場ミルハス・にぎわい交流館 AU 前

## 南北縦断線

- **名前**: 南北縦断線
- **系統番号**: 004
- **つなぐバス停の一覧**: 緑が丘, 中央公園, さくら通り, 北高前, 大学病院
