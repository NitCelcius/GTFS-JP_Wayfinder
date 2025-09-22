@echo off
REM Wrapper to call PowerShell pre-push hook on Windows (which runs pnpm run prepush)
powershell -NoProfile -Command "pnpm run prepush"
