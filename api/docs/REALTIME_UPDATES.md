# GTFS-JP Real-time Updates Implementation

This document describes the GTFS-JP Real-time updates feature added to the API endpoints.

## Overview

The API now includes mock GTFS-JP Real-time trip update information for bus schedules. This provides users with estimated arrival/departure times and delay information for buses, following the [GTFS Real-time specification](https://developers.google.com/transit/gtfs-realtime/reference).

**Current Status**: Mock implementation - generates realistic delay data for testing and UI development. Ready for integration with actual GTFS-JP Real-time feeds.

## Affected Endpoints

### 1. `/trips/journey` - Trip Journey Information

**Description**: Returns stop-by-stop information for a trip journey with real-time updates.

**Example Request**:
```bash
GET /trips/journey?trip_id=平日_06時50分_系統42202&from_stop_id=1021_01
```

**Example Response** (partial):
```json
[
  {
    "trip_id": "平日_06時50分_系統42202",
    "stop_id": "1183_01",
    "fare": 290,
    "departure_time": "06:50:00",
    "arrival_time": "06:50:00",
    "departure_datetime": "2021-01-01T06:50:00",
    "arrival_datetime": "2021-01-01T06:50:00",
    "realtime_update": {
      "delay_seconds": 60,
      "forecasted_arrival_time": "06:51:00",
      "forecasted_departure_time": "06:51:00",
      "forecasted_arrival_datetime": "2021-01-01T06:51:00",
      "forecasted_departure_datetime": "2021-01-01T06:51:00"
    }
  }
]
```

### 2. `/stops/{stop_id}/upcoming` - Upcoming Buses at Stop

**Description**: Returns upcoming buses at a stop with real-time updates.

**Example Request**:
```bash
GET /stops/1021_01/upcoming?limit=2
```

**Example Response**:
```json
{
  "stop_id": "1021_01",
  "buses": [
    {
      "trip_id": "平日_06時50分_系統42202",
      "arrival_time": "07:07:00",
      "departure_time": "07:07:00",
      "arrival_datetime": "2025-10-31T07:07:00",
      "departure_datetime": "2025-10-31T07:07:00",
      "route_name": null,
      "destination_display_name": null,
      "destination_stop_id": null,
      "stops": null,
      "realtime_update": {
        "delay_seconds": 120,
        "forecasted_arrival_time": "07:09:00",
        "forecasted_departure_time": "07:09:00",
        "forecasted_arrival_datetime": "2025-10-31T07:09:00",
        "forecasted_departure_datetime": "2025-10-31T07:09:00"
      }
    }
  ]
}
```

## Real-time Update Object

The `realtime_update` field is an optional object with the following structure:

```typescript
interface RealtimeUpdate {
  delay_seconds: number | null;           // Delay in seconds (positive=late, negative=early)
  forecasted_arrival_time: string | null; // Predicted arrival time (HH:MM:SS)
  forecasted_departure_time: string | null; // Predicted departure time (HH:MM:SS)
  forecasted_arrival_datetime: string | null; // Predicted arrival (ISO 8601)
  forecasted_departure_datetime: string | null; // Predicted departure (ISO 8601)
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `delay_seconds` | `int \| null` | Delay in seconds. Positive values indicate the bus is running late, negative values indicate early arrival. |
| `forecasted_arrival_time` | `string \| null` | Predicted arrival time in HH:MM:SS format based on current conditions. |
| `forecasted_departure_time` | `string \| null` | Predicted departure time in HH:MM:SS format based on current conditions. |
| `forecasted_arrival_datetime` | `string \| null` | Predicted arrival time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS). |
| `forecasted_departure_datetime` | `string \| null` | Predicted departure time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS). |

### Null Values

The `realtime_update` field can be `null` in the following cases:
- No real-time data is available for this trip/stop combination (~20% probability in mock)
- Real-time data feed is unavailable
- Trip has not yet started or has already completed

## Mock Implementation Details

The current implementation uses a mock data generator (`realtime_mock.py`) that simulates realistic bus delays:

### Delay Distribution
- **80% chance** of having real-time update data
- **20% chance** of `null` (no data available)

### Delay Characteristics
- **Range**: -120 seconds (2 min early) to 600 seconds (10 min late)
- **Distribution**: Weighted toward on-time or slight delays
  - 30% on-time (0 seconds)
  - 20% 30 seconds late
  - 15% 1 minute late
  - 10% 2 minutes late
  - Lower probability for longer delays
  - Small chance of early arrival

### Forecasted Time Calculation
Forecasted times are automatically calculated by:
1. Parsing the scheduled arrival/departure times
2. Adding the delay in seconds
3. Formatting as both HH:MM:SS and ISO 8601 datetime

## Frontend Integration Guide

### Displaying Delay Information

```typescript
// Example: Display delay badge
function DelayBadge({ realtimeUpdate }: { realtimeUpdate: RealtimeUpdate | null }) {
  if (!realtimeUpdate || realtimeUpdate.delay_seconds === null) {
    return null; // No real-time data
  }

  const delayMinutes = Math.round(realtimeUpdate.delay_seconds / 60);
  
  if (delayMinutes === 0) {
    return <span className="badge-success">On Time</span>;
  } else if (delayMinutes > 0) {
    return <span className="badge-warning">{delayMinutes} min late</span>;
  } else {
    return <span className="badge-info">{Math.abs(delayMinutes)} min early</span>;
  }
}
```

### Using Forecasted Times

```typescript
// Example: Display arrival time with forecast
function ArrivalTime({ 
  scheduledTime, 
  scheduledDatetime,
  realtimeUpdate 
}: BusTimeProps) {
  const displayTime = realtimeUpdate?.forecasted_arrival_time || scheduledTime;
  const displayDatetime = realtimeUpdate?.forecasted_arrival_datetime || scheduledDatetime;
  const hasDelay = realtimeUpdate && realtimeUpdate.delay_seconds !== 0;

  return (
    <div>
      <time dateTime={displayDatetime}>
        {formatTime(displayTime)}
        {hasDelay && <span className="text-warning"> (Delayed)</span>}
      </time>
      {hasDelay && (
        <div className="text-muted small">
          Scheduled: {formatTime(scheduledTime)}
        </div>
      )}
    </div>
  );
}
```

### UI/UX Recommendations

1. **Visual Indicators**:
   - Show scheduled time with strikethrough when delayed
   - Highlight forecasted time in a different color (e.g., orange for delays)
   - Use badges or icons to indicate delay status

2. **Information Hierarchy**:
   - Primary: Forecasted time (if available)
   - Secondary: Scheduled time (shown as reference when delayed)
   - Tertiary: Delay amount in minutes

3. **Null Handling**:
   - Gracefully fall back to scheduled times when `realtime_update` is `null`
   - Consider showing an indicator that real-time data is unavailable

4. **Accessibility**:
   - Use semantic HTML (`<time>` element with `datetime` attribute)
   - Provide text alternatives for visual indicators
   - Ensure color is not the only means of conveying delay information

## Future: Real GTFS-JP Real-time Integration

To integrate with actual GTFS-JP Real-time feeds:

1. **Replace Mock Generator**: Update `realtime_mock.py` to fetch from real-time feed
2. **Add Data Source Configuration**: Environment variables for feed URLs
3. **Implement Caching**: Cache real-time data with appropriate TTL (e.g., 30 seconds)
4. **Error Handling**: Handle feed unavailability gracefully
5. **Feed Validation**: Validate incoming GTFS Real-time protobuf messages
6. **Trip Matching**: Match trip_id between static GTFS and real-time feed

### Example Real Integration (Future)

```python
# Future implementation sketch
async def get_realtime_updates(trip_id: str) -> dict:
    """Fetch real-time updates from GTFS-JP Real-time feed."""
    feed_url = os.environ.get("GTFS_REALTIME_FEED_URL")
    
    # Fetch and parse protobuf
    response = await fetch_gtfs_realtime_feed(feed_url)
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)
    
    # Find trip updates
    for entity in feed.entity:
        if entity.HasField('trip_update'):
            if entity.trip_update.trip.trip_id == trip_id:
                return parse_trip_update(entity.trip_update)
    
    return None
```

## Testing

### Unit Tests
- `tests/test_realtime_updates.py` - Mock generation and model validation
- All tests pass (66/66)

### Manual Testing
```bash
# Test upcoming endpoint
curl "http://localhost:8002/stops/1021_01/upcoming?limit=2"

# Test journey endpoint
curl "http://localhost:8002/trips/journey?trip_id=平日_06時50分_系統42202&from_stop_id=1021_01"
```

## API Compatibility

- **Backward Compatible**: The `realtime_update` field is optional and nullable
- **Existing Clients**: Will continue to work without modification
- **New Clients**: Can opt-in to using real-time data when available

## Related Files

- `api/src/gtfs_jp_wayfinder/models.py` - Pydantic models
- `api/src/gtfs_jp_wayfinder/realtime_mock.py` - Mock data generator
- `api/src/gtfs_jp_wayfinder/routers/trips.py` - Journey endpoint
- `api/src/gtfs_jp_wayfinder/routers/stops.py` - Upcoming endpoint
- `api/tests/test_realtime_updates.py` - Test suite
