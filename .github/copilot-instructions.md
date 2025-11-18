## Quick context (what this repo is)

- **Transit routing API + Web frontend**: Monorepo with `api/` (Python FastAPI serving GTFS transit data) and `web/` (Next.js frontend). Uses Turbo for workspace orchestration.
- **Heavy GTFS data loading**: `data/gtfs-akita-chuo-kotsu/` contains bus route CSVs loaded into memory at API startup via pandas/NetworkX graphs. This is the core bottleneck.
- **Singleton wayfinder**: API uses a global `AkitaBusWayFinder` instance with thread-safe initialization (see `services/wayfinder.py`).

## Tool Setup (IMPORTANT - Read First)

This project uses [mise](https://mise.jdx.dev/) to manage development tools for consistent versions across environments (Python 3.13, pnpm 10.14.0, uv 0.8.20 in `mise.toml`). **Never use system `python` or `node` directly.**

1. **Install mise** (if not already installed):

   ```bash
   # macOS: brew install mise
   # Linux/WSL: curl https://mise.run | sh
   # Windows PowerShell: winget install jdx.mise  # or: scoop install mise
   # Or: cargo install mise (any platform)
   ```

2. **Install project tools**:

   ```bash
   mise install  # Installs pnpm@10.14.0 and uv@0.8.20 from mise.toml
   ```

3. **Use `mise activate` to source tools into your shell** (most convenient):

   ```bash
   mise activate  # Then run commands directly: pnpm install, python -m pytest, etc.
   ```

   **Or use `mise exec` for one-off commands** (works identically on Windows PowerShell, bash, etc.):

   ```bash
   # Node/pnpm commands
   mise exec pnpm install
   mise exec pnpm dev

   # Python commands (always through uv)
   mise exec uv run python -m pytest tests/test_file.py -v
   mise exec uv run ruff check src/
   ```

   On Windows PowerShell, `mise activate` is handled automatically by your profile, so you can typically run commands directly without `mise exec`.

**Critical**: The async lifespan in `main.py` uses `asyncio.to_thread` to run blocking pandas CSV loads without blocking the event loop. This requires Python 3.13+; mise ensures this version is installed.

See `CONTRIBUTING.md` for detailed setup instructions.

## What an AI agent should know first

### API Architecture (Key Files)

- **`main.py`**: FastAPI app with async lifespan that calls `wayfinder_adapter.initialize()` during startup
- **`database.py`**: Core `AkitaBusWayFinder` class - loads GTFS CSVs with pandas, builds NetworkX graphs, manages numpy datetime64 conversions
- **`services/wayfinder.py`**: Thread-safe singleton wrapper around `AkitaBusWayFinder`
- **`services/wayfinder_adapter.py`**: Async adapter layer that converts numpy datetimes to strings for Pydantic models
- **`routers/`**: FastAPI route handlers (`stops.py`, `trips.py`, `path.py`) with expand parameter patterns

### Critical Data Flow Understanding

1. **Startup**: `main.py` lifespan → `wayfinder_adapter.initialize()` → `wayfinder.initialize()` → `AkitaBusWayFinder.initialize()` loads CSVs
2. **Request**: Router → `wayfinder_adapter.function()` → `wayfinder.function()` → `AkitaBusWayFinder` method
3. **Data conversion**: NetworkX graphs + pandas DataFrames → numpy datetime64 → string formatting for JSON responses

### Frontend Integration

- **Generated client**: `web/src/api/` contains TypeScript client auto-generated from `web/openapi.json`
- **Contract**: Change API models → run `scripts/generate-openapi.js` → updates client types
- **MSW mocking**: `web/src/mocks/` contains mock service worker patterns for testing

### Frontend Architecture (Key Patterns)

- **Domain-driven structure**: `web/src/domains/` organizes features by business domain (`bus-stop/`, `route-search/`, `recent/`)
- **Component hierarchy**: `components/common/` for shared UI, `components/figma/` for design system components
- **Type-safe API integration**: Generated client in `api/` with manual wrapper in `lib/api.ts` for error handling
- **CSS custom properties**: Extensive use of `--var()` tokens in `globals.css` for consistent theming and responsive design

## Dev / run commands (how maintainers run the project)

**Important**: This project uses [mise](https://mise.jdx.dev/) to manage development tools. Always use `mise install` first to install the correct versions of pnpm and uv, then use `mise exec` to run commands.

- **Tool installation**: `mise install` (installs pnpm@10.14.0 and uv@0.8.20 from mise.toml)

### Quick Command Reference

| Task                        | Command                                                       |
| --------------------------- | ------------------------------------------------------------- |
| **Setup**                   | `mise install && pnpm install` (with `mise activate` sourced) |
| **Start everything**        | `pnpm dev` (from root)                                        |
| **Start API only**          | `cd api && pnpm dev`                                          |
| **Start Web only**          | `cd web && pnpm dev`                                          |
| **Run API tests**           | `cd api && pnpm test`                                         |
| **Run linting**             | `cd api && pnpm run lint`                                     |
| **Generate OpenAPI client** | `pnpm openapi-generate` (from root, runs exact same script)   |
| **Check Python syntax**     | `uv run python -m py_compile src/...`                         |

- Root (recommended workspace orchestration): Root scripts (uses turbo):
  - `mise exec pnpm dev` -> runs turbo run dev (starts both workspaces if configured)
  - `mise exec pnpm build`
  - `mise exec pnpm test`

- API service (local development):
  - From workspace root: `mise exec pnpm --filter api dev` (pnpm workspace filter) or `cd api && mise exec pnpm dev`
  - The package.json in `api/` runs `uv run python -m uvicorn src.gtfs_jp_wayfinder.main:app --host 0.0.0.0 --port 8002` (uv is managed by mise).
  - Important: the API expects the GTFS CSV directory to be at `./data/gtfs-akita-chuo-kotsu/` relative to the process cwd. Starting the API from the repo root (or adjusting the path) is required.

- Web frontend:
  - `cd web && mise exec pnpm dev` (Next.js dev server)

- Docker/composition: a root `docker-compose.yml` references `api` and `web` compose files. Use Docker Compose for containerized runs.

## Tests & lint

- API tests: `cd api && pnpm test` (package.json maps to `uv run pytest`). Alternatively run `uv run pytest` inside the project root.
- Lint: `cd api && pnpm run lint` (runs `ruff` via `uv`). `pyproject.toml` contains the ruff config and ignored rules — preserve those when editing linter settings. Note that when chatting, you should always verify with lint.
- **GitHub Actions CI**: Linting and testing are automatically run via GitHub Actions before merging. Run lint and tests locally before pushing to catch issues early and avoid CI failures.

## Environment Variables (API)

Configure these in tests via `conftest.py` or in `.env` for local development:

- **`API_NEARBY_STOPS_MAX_LIMIT`** (default: 100): Maximum number of nearby stops returned by `/stops/nearby` endpoint
- **`API_BATCH_MAX_TRIP_IDS`** (default: varies by endpoint): Maximum trip IDs allowed in batch requests to prevent memory overload
- **`CORS_ORIGINS`** (comma-separated): Override CORS allowed origins. If not set, defaults to `localhost:3000,8000,8002` for development

## Patterns and conventions specific to this repo

### DateTime Handling (Critical)

- **All stop times use numpy datetime64**: Stored as `np.datetime64` in DataFrames, converted via `time_str_to_np_datetime()` and `np_datetime_truncate_to_str()`
- **API responses need string format**: `wayfinder_adapter.py` handles conversion from numpy → HH:MM:SS strings for Pydantic models
- **Default date is "2021-01-01"**: Times are anchored to this date for comparison purposes (date portion is meaningless)

### Service Architecture Patterns

- **Singleton + adapter pattern**: `wayfinder.py` (singleton) → `wayfinder_adapter.py` (async + type conversion) → FastAPI routers
- **Thread-safe lazy initialization**: `_wf_lock` in `wayfinder.py` ensures safe concurrent access during startup
- **Expand parameter pattern**: Routes accept `?expand=trip_info,stops` to include related data. Implementation: routers call `parse_expand()` to validate tokens against an allowed list, then pass the list to adapter functions which conditionally populate related fields. Example: `GET /stops/{id}?expand=trip_info` includes trip details in the response instead of just stop metadata.

### Router Implementation Pattern (Expand Parameters)

When adding new routes:

1. Define allowed expand tokens at the top of the router file (e.g., `{"trip_info", "stops"}`)
2. Use `parse_expand(expand_str)` to validate and parse the query parameter
3. Pass the parsed list to the adapter function
4. In the adapter/database layer, conditionally build related data based on the expand list
5. Example from `stops.py`: `/nearby?expand=trip_info` returns full trip schedules instead of just stop names

### Graph-Based Routing

- **NetworkX directed graphs**: `generate_graph()` creates stop-to-stop connections, `graph_via_service_id` for date-specific routing
- **Shortest path helpers**: Use existing `get_shortest_path()`, `get_travels_from_path()`, `get_timed_travels_from_path()` rather than direct NetworkX calls
- **Service ID mapping**: `generate_calendar()` builds date → service_id lookup for schedule-aware routing

### Testing Patterns

- **`conftest.py` session fixture**: Initializes real GTFS data once per test session via `TestClient`. Set `API_NEARBY_STOPS_MAX_LIMIT` and `API_BATCH_MAX_TRIP_IDS` here.
- **Monkeypatch adapter functions**: Tests should mock `wayfinder_adapter.get_nearby_stops()`, `wayfinder_adapter.get_trip_info()` etc. to avoid heavy data dependencies. Example: `monkeypatch.setattr("gtfs_jp_wayfinder.services.wayfinder_adapter.get_nearby_stops", mock_func)`
- **Pydantic model construction**: Use model factories like `TripInfoList(trips=[TripInfo(...)])` in test mocks. Ensure mock stop_ids match known stops from the city mock data (see "When creating a mock" section below).
- **When to use full initialization**: Use real data initialization only for integration tests (e.g., `test_path_search_and_travels.py`). Use mocks for unit tests to keep test runs fast.

### Frontend Component Patterns

- **Atomic design**: Components follow common/figma/icons structure with clear prop interfaces
- **Custom CSS properties**: All spacing uses `--spacing-*`, `--size-*` tokens for consistency (e.g., `--size-spacing-lg`)
- **Interactive state handling**: Cards and buttons use Tailwind classes with hover/active states
- **Type converters**: `lib/utils.ts` contains formatters like `formatTime()`, `formatDepartureTime()` for API data display
- **Domain types**: Each domain (`types/busStop.ts`) defines interfaces that bridge API types with UI component needs

## Integration & cross-component notes

- OpenAPI: `web/openapi.json` and the generated TypeScript client in `web/src/api/` are the contract between API and frontend. If you change API models, run `pnpm openapi-generate` (from root, runs exact same script) to update the client.
- External services: `busloc_grabber` pulls live bus GPS data from `https://akita.bustei.net/buslocation/IchigoMap.txt` — network calls are simple `requests.get`. Consider stubbing `requests` in tests or using recorded fixtures.

## Frontend Development Patterns

### Component Architecture

- **Domain-driven organization**: Features live in `domains/bus-stop/`, `domains/route-search/`, etc. with self-contained logic
- **Shared component library**: `components/common/` contains reusable UI primitives (Card, Button, LoadingSpinner)
- **Domain-specific internal components**: `domains/[domain]/internal/` stores components meant to be used only within that domain, not shared across the app
- **Barrel exports**: Each folder has `index.ts` for clean imports (`@/components/common`, `@/domains/bus-stop`)
- **Note**: `components/figma/` has been removed; design system components are now co-located with domains

### Component & Storybook Patterns

- **Container vs. presentational split**: Components avoid fetching logic for Storybook compatibility. Follow the pattern: `RouteSearchPage` (presentational) + `RouteSearchPageContainer` (with data fetching)
- **Storybook coverage**: We create stories for all components, including internal domain components. This requires keeping display logic separate from data-fetching logic
- **Pattern enforcement**: Check existing stories in `stories/` for reference implementation

### Styling & Design System

- **CSS custom properties**: All sizing uses semantic tokens (`--size-spacing-lg`, `--max-w-mobile`, `--radius-lg`)
- **Dark mode support**: CSS variables switch automatically via `.dark` class
- **Mobile-first**: Fixed max-width container (`--max-w-mobile: 24.5625rem`) centers content
- **Tailwind safelist**: CSS custom property patterns are safelisted for `[var(--*)]` usage

### Type Safety & Data Flow

- **Generated API client**: `@hey-api/openapi-ts` creates typed client from OpenAPI spec in `src/api/`
- **Manual API wrapper**: `lib/api.ts` adds error handling and base URL config around generated client
- **Domain type conversion**: Types like `RouteSearchResult` bridge API responses with UI component needs
- **Utility converters**: `lib/utils.ts` handles time formatting, text truncation, debouncing for display

### State Management & Navigation

- **Next.js App Router**: File-based routing in `app/` with dynamic routes (`bus-stop/[id]`)
- **Component composition**: Pages are thin wrappers that handle routing, domains handle business logic
- **Prop drilling**: Navigation callbacks passed down (`onNavigateToRoute`, `onBack`) rather than router hooks in components
- **Mock data patterns**: `mocks/routeSearchMocks.ts` provides typed fixtures matching API response shapes

### Common Frontend Conventions

- **Expand parameters**: Components mirror API expand patterns (`?expand=trip_info,stops`) for progressive data loading
- **Error boundaries**: API wrapper catches and transforms errors to user-friendly messages
- **Time display**: Consistent formatting via `formatTime()`, `formatDepartureTime()` handles same-day vs. absolute dates
- **Interactive feedback**: Cards use hover states, active transforms (`active:scale-[0.98]`), loading spinners

## Common gotchas discovered in repo scan

### Critical Path Issues

- **CWD dependency**: `main.py` calls `initialize("./data/gtfs-akita-chuo-kotsu/")` — API must run from repo root or data loading fails
- **Blocking startup**: Full CSV loading during lifespan startup can slow development. Consider background task pattern (commented in code)
- **Python 3.13+ requirement**: `pyproject.toml` specifies `requires-python = ">= 3.13"`, use `mise install` to get correct version

### Data Conversion Pitfalls

- **Numpy datetime leakage**: Raw `np.datetime64` objects break Pydantic validation, always convert via adapter layer
- **Time format mismatches**: Use `np_datetime_truncate_to_str()` consistently to avoid format inconsistencies
- **Service ID lookup**: Date-based routing requires `date_to_service_id` mapping, don't assume service IDs are static

### Configuration Issues

- **Malformed CORS origins**: `main.py` contains concatenated string in origins list (bug) - check `get_cors_origins()` function
- **Missing environment variables**: API uses `API_NEARBY_STOPS_MAX_LIMIT`, `API_BATCH_MAX_TRIP_IDS` - set in tests via `conftest.py`

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
