# Contributing to GTFS-JP Wayfinder

Thank you for your interest in contributing to GTFS-JP Wayfinder! This guide will help you get started with the development environment.

## Prerequisites

This project uses [mise](https://mise.jdx.dev/) to manage development tools. Mise simplifies the installation and management of tools like Node.js, Python, pnpm, and uv.

### Installing mise

Follow the installation instructions on the [mise website](https://mise.jdx.dev/getting-started.html). For most systems:

```bash
# macOS (via Homebrew)
brew install mise

# Linux/WSL (via curl)
curl https://mise.run | sh

# Or via cargo
cargo install mise
```

After installation, add mise to your shell configuration (follow the instructions provided by mise).

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
mise exec node ./scripts/generate-openapi.js
```

## Why mise?

We use mise because:
- **Consistent tool versions**: Everyone uses the exact same versions of pnpm, uv, Node.js, and Python
- **Simplified setup**: One command (`mise install`) installs all required tools
- **GitHub Copilot friendly**: Automated tools and AI assistants can easily install and use the development environment
- **Cross-platform**: Works consistently across macOS, Linux, and Windows (WSL)

## Repository Structure

- `api/` - Python FastAPI service using uv for dependency management
- `web/` - Next.js application 
- `data/gtfs-akita-chuo-kotsu/` - GTFS CSV data files
- `scripts/` - Build and utility scripts
- `mise.toml` - Tool version configuration

## Important Notes

- The API expects GTFS CSV data to be at `./data/gtfs-akita-chuo-kotsu/` relative to the process working directory
- Always run the API from the repository root to ensure correct data path resolution
- Use `mise exec` prefix for all tool commands to ensure version consistency

## Getting Help

If you encounter issues:
1. Check that mise is properly installed and configured
2. Ensure all tools are installed with `mise install`
3. Verify you're running commands from the correct directory
4. Check the `.github/copilot-instructions.md` file for additional context

For questions about the codebase, see the detailed documentation in `.github/copilot-instructions.md`.