$ErrorActionPreference = 'Stop'
Write-Output "Running API format (ruff) via pnpm..."
Write-Output "Running turbo prepush (lint only) via pnpm..."
pnpm run prepush
Write-Output "Pre-push checks passed."
