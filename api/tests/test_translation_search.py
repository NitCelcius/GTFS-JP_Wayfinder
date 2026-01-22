"""Tests for stop search using translation data (e.g., hiragana readings)."""


def test_search_stops_by_hiragana_exact(monkeypatch, client):
    """Test that searching with hiragana returns the correct stop (exact match)."""
    import pandas as pd

    # Create a fake wayfinder with translation support
    class FakeWF:
        def __init__(self):
            # Simulate translation mapping: hiragana -> original name
            self._translation_to_stop_name = {
                "あおばだい": "青葉台",
                "ちゅうおうこうえん": "中央公園",
            }
            # Simulate stops DataFrame
            self.df_stops = pd.DataFrame(
                [
                    {"stop_id": "1011_01", "stop_name": "青葉台"},
                    {"stop_id": "1011_02", "stop_name": "青葉台"},
                    {"stop_id": "1021_01", "stop_name": "中央公園"},
                ]
            )

        def get_stop_id(self, stop_name, exact=False):
            if exact:
                # Exact match: first try direct stop_name match
                ret = self.df_stops[self.df_stops["stop_name"] == stop_name][
                    ["stop_id", "stop_name"]
                ]

                # If no results, check if the query matches a translation
                if ret.empty and stop_name in self._translation_to_stop_name:
                    original_name = self._translation_to_stop_name[stop_name]
                    ret = self.df_stops[self.df_stops["stop_name"] == original_name][
                        ["stop_id", "stop_name"]
                    ]
            else:
                # Partial match: search in stop_name column
                ret = self.df_stops[
                    self.df_stops["stop_name"].str.contains(stop_name)
                ][["stop_id", "stop_name"]]

                # Also search for partial matches in translations
                matching_original_names = [
                    original_name
                    for translation, original_name in self._translation_to_stop_name.items()
                    if stop_name in translation
                ]

                if matching_original_names:
                    translation_matches = self.df_stops[
                        self.df_stops["stop_name"].isin(matching_original_names)
                        & ~self.df_stops["stop_name"].str.contains(stop_name)
                    ][["stop_id", "stop_name"]]

                    ret = pd.concat([ret, translation_matches], ignore_index=True)
                    ret = ret.drop_duplicates(subset=["stop_id"])

            return ret

    monkeypatch.setattr("gtfs_jp_wayfinder.services.wayfinder._wf", FakeWF())

    # Search using hiragana (exact match)
    resp = client.get("/stops/?name=あおばだい&exact=true")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["stop_ids"]) == 2
    # Both should be for "青葉台"
    for stop in data["stop_ids"]:
        assert stop["stop_name"] == "青葉台"


def test_search_stops_by_hiragana_partial(monkeypatch, client):
    """Test that partial hiragana search returns matching stops."""
    import pandas as pd

    class FakeWF:
        def __init__(self):
            self._translation_to_stop_name = {
                "あおばだい": "青葉台",
                "あおばえん": "青葉園",
                "ちゅうおうこうえん": "中央公園",
            }
            self.df_stops = pd.DataFrame(
                [
                    {"stop_id": "1011_01", "stop_name": "青葉台"},
                    {"stop_id": "1010_01", "stop_name": "青葉園"},
                    {"stop_id": "1021_01", "stop_name": "中央公園"},
                ]
            )

        def get_stop_id(self, stop_name, exact=False):
            if exact:
                ret = self.df_stops[self.df_stops["stop_name"] == stop_name][
                    ["stop_id", "stop_name"]
                ]
                if ret.empty and stop_name in self._translation_to_stop_name:
                    original_name = self._translation_to_stop_name[stop_name]
                    ret = self.df_stops[self.df_stops["stop_name"] == original_name][
                        ["stop_id", "stop_name"]
                    ]
            else:
                ret = self.df_stops[
                    self.df_stops["stop_name"].str.contains(stop_name)
                ][["stop_id", "stop_name"]]

                matching_original_names = [
                    original_name
                    for translation, original_name in self._translation_to_stop_name.items()
                    if stop_name in translation
                ]

                if matching_original_names:
                    translation_matches = self.df_stops[
                        self.df_stops["stop_name"].isin(matching_original_names)
                        & ~self.df_stops["stop_name"].str.contains(stop_name)
                    ][["stop_id", "stop_name"]]

                    ret = pd.concat([ret, translation_matches], ignore_index=True)
                    ret = ret.drop_duplicates(subset=["stop_id"])

            return ret

    monkeypatch.setattr("gtfs_jp_wayfinder.services.wayfinder._wf", FakeWF())

    # Search using partial hiragana "あおば" (should match both 青葉台 and 青葉園)
    resp = client.get("/stops/?name=あおば")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["stop_ids"]) == 2
    stop_names = {stop["stop_name"] for stop in data["stop_ids"]}
    assert "青葉台" in stop_names
    assert "青葉園" in stop_names


def test_search_stops_kanji_still_works(monkeypatch, client):
    """Test that searching with original kanji names still works."""
    import pandas as pd

    class FakeWF:
        def __init__(self):
            self._translation_to_stop_name = {
                "あおばだい": "青葉台",
            }
            self.df_stops = pd.DataFrame(
                [
                    {"stop_id": "1011_01", "stop_name": "青葉台"},
                ]
            )

        def get_stop_id(self, stop_name, exact=False):
            if exact:
                ret = self.df_stops[self.df_stops["stop_name"] == stop_name][
                    ["stop_id", "stop_name"]
                ]
                if ret.empty and stop_name in self._translation_to_stop_name:
                    original_name = self._translation_to_stop_name[stop_name]
                    ret = self.df_stops[self.df_stops["stop_name"] == original_name][
                        ["stop_id", "stop_name"]
                    ]
            else:
                ret = self.df_stops[
                    self.df_stops["stop_name"].str.contains(stop_name)
                ][["stop_id", "stop_name"]]

                matching_original_names = [
                    original_name
                    for translation, original_name in self._translation_to_stop_name.items()
                    if stop_name in translation
                ]

                if matching_original_names:
                    translation_matches = self.df_stops[
                        self.df_stops["stop_name"].isin(matching_original_names)
                        & ~self.df_stops["stop_name"].str.contains(stop_name)
                    ][["stop_id", "stop_name"]]

                    ret = pd.concat([ret, translation_matches], ignore_index=True)
                    ret = ret.drop_duplicates(subset=["stop_id"])

            return ret

    monkeypatch.setattr("gtfs_jp_wayfinder.services.wayfinder._wf", FakeWF())

    # Search using kanji (exact match)
    resp = client.get("/stops/?name=青葉台&exact=true")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["stop_ids"]) == 1
    assert data["stop_ids"][0]["stop_name"] == "青葉台"
