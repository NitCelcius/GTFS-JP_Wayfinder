# Implementation Summary: Conditional Distance Display on Bus Stop Page

## Issue Overview

**Issue Title**: ユーザの位置情報が許可され、かつユーザがバス停から遠くに居るときに /bus-stop/[ID] ページに距離を表示する

**Problem**: The distance indicator was always shown on the bus stop page, even when users were very close (<10m) to the stop, which was not useful.

**Solution**: Implement conditional distance display that only shows when:
1. User's location permission is granted
2. User is >= minimum threshold (default 10m) away from the bus stop

## Implementation Details

### 1. Environment Configuration

**Files Modified:**
- `web/src/lib/envSchema.ts`
- `web/src/lib/envUtils.ts`
- `web/.env.example`

Added new environment variable `NEXT_PUBLIC_MINIMUM_DIST_INDICATOR` with default value of 10 meters.

```typescript
NEXT_PUBLIC_MINIMUM_DIST_INDICATOR: {
  required: false,
  default: "10",
}
```

### 2. Shared Geolocation Hook

**Files Created:**
- `web/src/hooks/useGeolocation.ts`

**Files Modified:**
- `web/src/domains/bus-stop/hooks/useNearbyStops.ts`

Extracted geolocation logic into a reusable `useGeolocation` hook for consistent location handling across the application.

```typescript
export function useGeolocation(): GeolocationState {
  // Returns: { loading, error, position }
}
```

### 3. Distance Calculation

**Files Modified:**
- `web/src/domains/bus-stop/converter.ts`

Implemented Haversine formula for accurate distance calculation between two geographic coordinates:

```typescript
export function calculateDistance(
  stopLat?: number,
  stopLon?: number,
  userPosition?: GeolocationPosition | null
): string {
  // Returns formatted distance string (e.g., "120m", "1.5km") or empty string
}
```

### 4. Container Logic Update

**Files Modified:**
- `web/src/domains/bus-stop/BusStopInfoV2/BusStopInfoV2Container.tsx`

Updated container to:
1. Use the shared `useGeolocation` hook
2. Calculate distance with bus stop coordinates and user position
3. Apply threshold check to conditionally display distance

```typescript
// Only show distance if it meets the minimum threshold
const minDistThreshold = parseInt(
  getEnvValue("NEXT_PUBLIC_MINIMUM_DIST_INDICATOR") || "10",
  10
);

if (distanceInMeters < minDistThreshold) {
  calculatedDistance = "";
}
```

### 5. Storybook Stories

**Files Created:**
- `web/src/domains/bus-stop/BusStopInfoV2/internal/BusStopHeader.stories.tsx`

**Files Modified:**
- `web/src/domains/bus-stop/BusStopInfoV2/BusStopInfoV2.stories.tsx`
- `web/src/domains/bus-stop/internal/BusStopHeader.stories.tsx`

Added stories demonstrating both scenarios:
- `WithDistanceFarAway`: Shows distance when user is far from stop
- `WithoutDistanceCloseBy`: Hides distance when user is close
- `WithoutDistanceNoPermission`: Hides distance when location permission denied

### 6. Documentation and Screenshots

**Files Created:**
- `web/SCREENSHOTS.md`
- `web/BusStopHeader_WithDistance.png`
- `web/BusStopHeader_WithoutDistance.png`
- `web/BusStopInfoV2_WithDistance.png`
- `web/BusStopInfoV2_WithoutDistance.png`

Created comprehensive documentation with visual examples of both scenarios.

## Testing Results

### Unit Tests
```
Test Suites: 18 passed, 18 total
Tests:       208 passed, 208 total
Status:      ✅ All tests pass
```

### Linting
```
Status: ✅ Passed
- ESLint: No errors
- Prettier: All files formatted correctly
```

### Build
```
Status: ✅ Success
Output: Production build completed successfully
```

### Storybook
```
Status: ✅ Built successfully
- All stories render correctly
- Screenshots captured for documentation
```

## Configuration

Users can customize the minimum distance threshold by setting the environment variable:

```bash
# In .env or .env.local
NEXT_PUBLIC_MINIMUM_DIST_INDICATOR=10  # in meters
```

## Backward Compatibility

- ✅ No breaking changes
- ✅ Existing functionality preserved
- ✅ Graceful fallback when location unavailable
- ✅ Empty string returned when distance should not be shown

## Code Quality

- ✅ TypeScript type safety maintained
- ✅ Follows existing code patterns
- ✅ Proper error handling for edge cases
- ✅ Coordinate validation (lat/lon ranges)
- ✅ Reusable components (shared geolocation hook)

## Future Improvements

1. Consider caching geolocation to avoid repeated API calls
2. Add distance refresh when user moves significantly
3. Consider different thresholds for different use cases
4. Add user preference to always show/hide distance

## Files Changed Summary

- **Created**: 6 files (1 hook, 1 story file, 4 screenshots, 1 documentation)
- **Modified**: 8 files (env schema/utils, converter, containers, stories)
- **Total Changes**: 14 files

## Screenshots

See [web/SCREENSHOTS.md](./web/SCREENSHOTS.md) for visual documentation of the feature.
