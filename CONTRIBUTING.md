# Contributing to GTFS-JP Wayfinder

Thank you for your interest in contributing to GTFS-JP Wayfinder! This guide will help you get started with the development environment.

## Prerequisites

This project uses [mise](https://mise.jdx.dev/) to manage development tools. Mise simplifies the installation and management of tools like Node.js, Python, pnpm, and uv.

### Installing mise

Follow the installation instructions on the [mise website](https://mise.jdx.dev/getting-started.html).

### Setting up the development environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NitCelcius/GTFS-JP_Wayfinder.git
   cd GTFS-JP_Wayfinder
   ```

2. **Install development tools using mise:**
   ```bash
   mise install
   ```
   This will automatically install the correct versions of pnpm (10.14.0) and uv (0.8.20) as specified in `mise.toml`.

3. **Install project dependencies:**
   ```bash
   # Install all workspace dependencies
   mise exec pnpm install
   
   # Or use mise to ensure you're using the right pnpm version
   mise exec -- pnpm install
   ```

## Development Commands

All development commands should be run using mise to ensure you're using the correct tool versions:

### Root workspace commands (using turbo):
```bash
# Start development servers for both API and web
mise exec pnpm dev

# Build all workspaces
mise exec pnpm build

# Run tests across all workspaces
mise exec pnpm test

# Run linting
mise exec pnpm lint
```

### API-specific commands:
```bash
# From workspace root
mise exec pnpm --filter api dev

# Or from api/ directory
cd api
mise exec pnpm dev

# Run API tests
cd api
mise exec pnpm test

# Lint API code
cd api
mise exec pnpm lint
```

### Web-specific commands:
```bash
# From web/ directory
cd web
mise exec pnpm dev

# Build web app
cd web
mise exec pnpm build
```

### Generate OpenAPI client:
```bash
# From workspace root
mise exec pnpm run openapi-generate
```

