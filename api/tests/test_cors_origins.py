"""Tests for CORS origins configuration."""

import logging
import os
from unittest.mock import patch

from gtfs_jp_wayfinder.main import get_cors_origins


class TestCORSOrigins:
    """Test CORS origins configuration handling."""

    def test_cors_origins_with_asterisk_logs_warning(self, caplog):
        """Test that setting CORS_ORIGINS to '*' logs a warning."""
        with (
            patch.dict(os.environ, {"CORS_ORIGINS": "*"}),
            caplog.at_level(logging.WARNING),
        ):
            origins = get_cors_origins()

            # Should return ['*']
            assert origins == ["*"]

            # Should log a warning about security risk
            assert any(
                "CORS_ORIGINS is set to '*' (allow all origins)" in record.message
                for record in caplog.records
            )
            assert any(
                "ONLY be used for development purposes" in record.message
                for record in caplog.records
            )
            assert any(
                "Never use this in production" in record.message
                for record in caplog.records
            )

    def test_cors_origins_with_asterisk_and_whitespace(self, caplog):
        """Test that asterisk with surrounding whitespace is handled correctly."""
        with (
            patch.dict(os.environ, {"CORS_ORIGINS": "  *  "}),
            caplog.at_level(logging.WARNING),
        ):
            origins = get_cors_origins()

            # Should return ['*'] even with whitespace
            assert origins == ["*"]

            # Should log the warning
            assert any(
                "CORS_ORIGINS is set to '*'" in record.message
                for record in caplog.records
            )

    def test_cors_origins_with_comma_separated_origins(self, caplog):
        """Test that comma-separated origins are parsed correctly."""
        test_origins = "http://example.com,http://test.com"
        with (
            patch.dict(os.environ, {"CORS_ORIGINS": test_origins}),
            caplog.at_level(logging.INFO),
        ):
            origins = get_cors_origins()

            # Should return parsed list
            assert origins == ["http://example.com", "http://test.com"]

            # Should log info about origins
            assert any(
                "CORS origins from environment" in record.message
                for record in caplog.records
            )

    def test_cors_origins_with_whitespace_in_list(self, caplog):
        """Test that whitespace around comma-separated origins is stripped."""
        test_origins = " http://example.com , http://test.com "
        with (
            patch.dict(os.environ, {"CORS_ORIGINS": test_origins}),
            caplog.at_level(logging.INFO),
        ):
            origins = get_cors_origins()

            # Should return parsed list with whitespace stripped
            assert origins == ["http://example.com", "http://test.com"]

    def test_cors_origins_not_set(self, caplog):
        """Test that default origins are used when CORS_ORIGINS is not set."""
        with (
            patch.dict(os.environ, {}, clear=True),
            caplog.at_level(logging.WARNING),
        ):
            origins = get_cors_origins()

            # Should return default development origins
            assert "http://localhost:3000" in origins
            assert "http://localhost:8000" in origins
            assert "http://localhost:8002" in origins

            # Should log warning about using defaults
            assert any(
                "CORS_ORIGINS not set, using defaults" in record.message
                for record in caplog.records
            )

    def test_cors_origins_empty_string(self, caplog):
        """Test that empty string is treated as not set."""
        with (
            patch.dict(os.environ, {"CORS_ORIGINS": ""}),
            caplog.at_level(logging.WARNING),
        ):
            origins = get_cors_origins()

            # Should return default origins (empty string is falsy)
            assert "http://localhost:3000" in origins

            # Should log warning about using defaults
            assert any(
                "CORS_ORIGINS not set, using defaults" in record.message
                for record in caplog.records
            )
