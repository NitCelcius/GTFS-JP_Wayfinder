"""Tests for stop search using translation data (e.g., hiragana readings).

These integration tests verify the translation-based search functionality
using real GTFS data from the gtfs-akita-chuo-kotsu dataset.
"""

import pytest


@pytest.mark.usefixtures("client")
class TestTranslationSearch:
    """Integration tests for translation-based stop search."""

    def test_search_stops_by_hiragana_exact(self, client):
        """Test that searching with hiragana returns the correct stop (exact match).

        Searches for 'あおばだい' which is the hiragana translation of '青葉台'
        in the real GTFS data (gtfs-akita-chuo-kotsu/translations.txt).
        """
        # Search using hiragana (exact match)
        resp = client.get("/stops/?name=あおばだい&exact=true")
        assert resp.status_code == 200
        data = resp.json()

        # Should find at least one stop named "青葉台"
        assert len(data["stop_ids"]) > 0

        # All results should be for "青葉台"
        for stop in data["stop_ids"]:
            assert stop["stop_name"] == "青葉台"

    def test_search_stops_by_hiragana_partial(self, client):
        """Test that partial hiragana search returns matching stops.

        Searches for 'あおば' which should match multiple stops:
        - 'あおばえん' (青葉園)
        - 'あおばだい' (青葉台)
        """
        # Search using partial hiragana "あおば"
        resp = client.get("/stops/?name=あおば")
        assert resp.status_code == 200
        data = resp.json()

        # Should find multiple stops
        assert len(data["stop_ids"]) >= 2

        # Collect stop names
        stop_names = {stop["stop_name"] for stop in data["stop_ids"]}

        # Should include both "青葉園" and "青葉台"
        assert "青葉台" in stop_names
        assert "青葉園" in stop_names

    def test_search_stops_kanji_still_works(self, client):
        """Test that searching with original kanji names still works.

        Verifies that adding translation support doesn't break
        the existing kanji-based search functionality.
        """
        # Search using kanji (exact match)
        resp = client.get("/stops/?name=青葉台&exact=true")
        assert resp.status_code == 200
        data = resp.json()

        # Should find at least one result
        assert len(data["stop_ids"]) > 0

        # All results should be for "青葉台"
        for stop in data["stop_ids"]:
            assert stop["stop_name"] == "青葉台"

    def test_search_stops_by_katakana(self, client):
        """Test that searching with katakana also works.

        Tests bidirectional conversion by searching with katakana
        when the translations.txt has hiragana (or vice versa).
        """
        # Search using katakana "アオバダイ" (should match "あおばだい" -> "青葉台")
        resp = client.get("/stops/?name=アオバダイ&exact=true")
        assert resp.status_code == 200
        data = resp.json()

        # Should find at least one stop named "青葉台"
        assert len(data["stop_ids"]) > 0

        # All results should be for "青葉台"
        for stop in data["stop_ids"]:
            assert stop["stop_name"] == "青葉台"

    def test_search_stops_with_special_chars(self, client):
        """Test that stops with special characters in names can be searched.

        Verifies that regex=False is properly applied to str.contains()
        by searching for a stop name with special chars like parentheses.
        """
        # Search for "日吉神社前（県道側）" which contains parentheses
        resp = client.get("/stops/?name=日吉神社前（県道側）&exact=true")
        assert resp.status_code == 200
        data = resp.json()

        # Should find the stop without regex errors
        assert len(data["stop_ids"]) > 0
        assert data["stop_ids"][0]["stop_name"] == "日吉神社前（県道側）"
