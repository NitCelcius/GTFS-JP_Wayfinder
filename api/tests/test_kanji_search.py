"""Tests for stop search using kanji characters directly.

These integration tests verify that searching with kanji characters works
correctly, especially when translation data is present. This ensures that
searching with original kanji names (not just their hiragana/katakana
translations) functions properly.
"""

import pytest


@pytest.mark.usefixtures("client")
class TestKanjiSearch:
    """Integration tests for kanji-based stop search."""

    def test_search_stops_by_single_kanji_partial(self, client):
        """Test that partial search with a single kanji character returns results.

        Searches for '東' which should match multiple stops like:
        - '秋田駅東口' (Akita Station East Exit)
        - '牛島東一丁目' (Ushijima East 1-chome)
        etc.

        This is a regression test for a bug where searching with kanji
        characters that weren't in the translations would cause an
        UnboundLocalError due to translation_matches being used outside
        its definition scope.
        """
        # Search using single kanji character (partial match)
        resp = client.get("/stops/?name=東&exact=false")
        assert resp.status_code == 200
        data = resp.json()

        # Should find multiple stops containing "東"
        assert len(data["stop_ids"]) > 0

        # All results should contain "東" in their name
        for stop in data["stop_ids"]:
            assert "東" in stop["stop_name"]

    def test_search_stops_by_kanji_partial(self, client):
        """Test that partial kanji search returns matching stops.

        Searches for '青葉' which should match stops like:
        - '青葉台'
        - '青葉園'
        """
        # Search using partial kanji "青葉"
        resp = client.get("/stops/?name=青葉")
        assert resp.status_code == 200
        data = resp.json()

        # Should find multiple stops
        assert len(data["stop_ids"]) >= 2

        # All results should contain "青葉" in their name
        for stop in data["stop_ids"]:
            assert "青葉" in stop["stop_name"]

    def test_search_stops_by_kanji_exact(self, client):
        """Test that exact kanji search works correctly.

        Verifies exact match functionality with kanji characters.
        """
        # Search using exact kanji match
        resp = client.get("/stops/?name=青葉台&exact=true")
        assert resp.status_code == 200
        data = resp.json()

        # Should find at least one result
        assert len(data["stop_ids"]) > 0

        # All results should be exactly "青葉台"
        for stop in data["stop_ids"]:
            assert stop["stop_name"] == "青葉台"

    def test_search_stops_with_mixed_chars(self, client):
        """Test that searching with mixed kanji/hiragana works.

        Verifies that stops with mixed character types in their names
        can be searched correctly.
        """
        # Search for a stop with mixed characters
        resp = client.get("/stops/?name=駅")
        assert resp.status_code == 200
        data = resp.json()

        # Should find multiple stops containing "駅"
        assert len(data["stop_ids"]) > 0

        # All results should contain "駅" in their name
        for stop in data["stop_ids"]:
            assert "駅" in stop["stop_name"]

