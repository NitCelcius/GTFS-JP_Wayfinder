# Nearby Bus Stops Endpoint

This document describes the `/stops/nearby` endpoint that finds nearby bus stops based on latitude and longitude coordinates.

## Endpoint

**GET** `/stops/nearby`

## Parameters

- `lat` (required): Latitude in decimal degrees (-90 to 90)
- `lon` (required): Longitude in decimal degrees (-180 to 180) 
- `limit` (optional): Maximum number of stops to return

## Response

Returns a JSON object with a list of nearby bus stops sorted by distance:

```json
{
  "stops": [
    {
      "stop_id": "1021_01",
      "stop_name": "中央公園",
      "distance_km": 0.0,
      "lat": 39.71676,
      "lon": 140.13113
    },
    {
      "stop_id": "2001_01", 
      "stop_name": "市役所前",
      "distance_km": 0.238,
      "lat": 39.71876,
      "lon": 140.13213
    }
  ]
}
```

## Environment Variables

- `API_NEARBY_STOPS_DEFAULT_LIMIT`: Default number of stops to return (default: 10)
- `API_NEARBY_STOPS_MAX_LIMIT`: Maximum allowed limit (default: 20)

## Examples

```bash
# Get 5 nearest stops to coordinates
curl "http://localhost:8002/stops/nearby?lat=39.71676&lon=140.13113&limit=5"

# Use default limit (10 stops)
curl "http://localhost:8002/stops/nearby?lat=39.71676&lon=140.13113"
```

## Implementation Notes

- Uses Haversine formula for accurate distance calculation
- Distance returned in kilometers, rounded to 3 decimal places
- Results sorted by distance from nearest to farthest
- Input validation ensures latitude/longitude are within valid ranges
- Limit validation prevents requests that exceed configured maximums

## Error Responses

- **400**: Invalid parameters (out of range coordinates, invalid limit)
- **422**: Missing required parameters or invalid parameter types