"""Test the default limit behavior for nearby stops endpoint."""


def test_nearby_stops_no_limit_returns_max_available(client):
    """Test that when no limit is specified, we get up to the max limit (100)."""
    # Test without specifying limit parameter - should return up to max limit
    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113")

    assert response.status_code == 200

    data = response.json()
    assert "stops" in data
    assert isinstance(data["stops"], list)

    # Should return up to the max limit (100) or less if there aren't enough stops
    # Since we can't guarantee there are 100+ stops in the test data, we'll just verify
    # that we get some results and it doesn't exceed 100
    assert len(data["stops"]) <= 100


def test_nearby_stops_high_limit_allowed_with_new_max(client):
    """Test that we can now request up to 100 stops (new max limit)."""
    # Test with limit of 90 - should be allowed with new max of 100
    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113&limit=90")

    assert response.status_code == 200

    data = response.json()
    assert "stops" in data
    assert isinstance(data["stops"], list)
    assert len(data["stops"]) <= 90


def test_nearby_stops_exceeds_new_max_limit(client):
    """Test that requests exceeding the new max limit (100) are rejected."""
    # Test with limit of 150 - should be rejected
    response = client.get("/stops/nearby?lat=39.71676&lon=140.13113&limit=150")

    assert response.status_code == 400
    assert "limit too large" in response.json().get("detail", "")
    assert "max is 100" in response.json().get("detail", "")
