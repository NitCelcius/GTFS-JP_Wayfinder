"""Test cases for agency endpoint."""

import pytest


@pytest.mark.usefixtures("client")
class TestAgencyEndpoint:
    """Test suite for /agency endpoint."""

    def test_get_agency_info_success(self, client):
        """Test that GET /agency returns agency information."""
        response = client.get("/agency")
        assert response.status_code == 200

        data = response.json()
        assert "agencies" in data
        assert isinstance(data["agencies"], list)
        assert len(data["agencies"]) > 0

        # Check first agency has required fields
        agency = data["agencies"][0]
        assert "agency_id" in agency
        assert "agency_name" in agency
        assert "agency_url" in agency
        assert "agency_timezone" in agency

        # Verify required fields are not None
        assert agency["agency_id"] is not None
        assert agency["agency_name"] is not None
        assert agency["agency_url"] is not None
        assert agency["agency_timezone"] is not None

    def test_get_agency_info_structure(self, client):
        """Test that agency response has correct structure."""
        response = client.get("/agency")
        assert response.status_code == 200

        data = response.json()
        agency = data["agencies"][0]

        # Check all expected fields are present
        expected_fields = {
            "agency_id",
            "agency_name",
            "agency_url",
            "agency_timezone",
            "agency_lang",
            "agency_phone",
            "agency_fare_url",
        }
        assert set(agency.keys()) == expected_fields

    def test_get_agency_akita_data(self, client):
        """Test agency endpoint with actual Akita data."""
        response = client.get("/agency")
        assert response.status_code == 200

        data = response.json()
        agency = data["agencies"][0]

        # Verify Akita Chuo Kotsu specific data
        assert agency["agency_id"] == "3410001000459"
        assert agency["agency_name"] == "秋田中央交通"
        assert agency["agency_url"] == "https://www.akita-chuoukotsu.co.jp/"
        assert agency["agency_timezone"] == "Asia/Tokyo"
        assert agency["agency_lang"] == "ja"


def test_agency_endpoint_with_monkeypatch(monkeypatch, client):
    """Test agency endpoint using monkeypatch for mocking."""

    def mock_get_agency_info():
        return [
            {
                "agency_id": "test_agency_1",
                "agency_name": "Test Transit Agency",
                "agency_url": "https://test-transit.example.com",
                "agency_timezone": "America/New_York",
                "agency_lang": "en",
                "agency_phone": "+1-555-0100",
                "agency_fare_url": "https://test-transit.example.com/fares",
            }
        ]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_agency_info",
        mock_get_agency_info,
    )

    response = client.get("/agency")
    assert response.status_code == 200

    data = response.json()
    assert len(data["agencies"]) == 1

    agency = data["agencies"][0]
    assert agency["agency_id"] == "test_agency_1"
    assert agency["agency_name"] == "Test Transit Agency"
    assert agency["agency_url"] == "https://test-transit.example.com"
    assert agency["agency_timezone"] == "America/New_York"
    assert agency["agency_lang"] == "en"
    assert agency["agency_phone"] == "+1-555-0100"
    assert agency["agency_fare_url"] == "https://test-transit.example.com/fares"


def test_agency_endpoint_with_multiple_agencies(monkeypatch, client):
    """Test agency endpoint with multiple agencies (future compatibility)."""

    def mock_get_agency_info():
        return [
            {
                "agency_id": "agency_1",
                "agency_name": "First Agency",
                "agency_url": "https://first.example.com",
                "agency_timezone": "Asia/Tokyo",
                "agency_lang": "ja",
                "agency_phone": None,
                "agency_fare_url": None,
            },
            {
                "agency_id": "agency_2",
                "agency_name": "Second Agency",
                "agency_url": "https://second.example.com",
                "agency_timezone": "Asia/Tokyo",
                "agency_lang": "ja",
                "agency_phone": None,
                "agency_fare_url": None,
            },
        ]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_agency_info",
        mock_get_agency_info,
    )

    response = client.get("/agency")
    assert response.status_code == 200

    data = response.json()
    assert len(data["agencies"]) == 2
    assert data["agencies"][0]["agency_id"] == "agency_1"
    assert data["agencies"][1]["agency_id"] == "agency_2"
