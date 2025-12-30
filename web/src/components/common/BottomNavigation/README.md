# Bottom Navigation Ripple Animation

## Overview
The bottom navigation bar now features a Material Design-inspired ripple animation when users tap on tabs. The ripple effect provides visual feedback to indicate user interaction.

## Behavior

### Tab Switching (Primary Color Ripple)
When clicking on a **different tab** (inactive → active):
- Shows a ripple animation with **primary accent color** (`--primaryaccent` / `#d0e5ce`)
- This green-tinted ripple indicates a successful tab switch
- Animation duration: 0.6 seconds

### Same Tab Click (Disabled Color Ripple)
When clicking on the **same tab** (already active):
- Shows a ripple animation with **background L2 color** (`--backgroundl2` / `#e2e2e2`)
- This gray ripple indicates the tab is already active (disabled action)
- Animation duration: 0.6 seconds

## Technical Implementation

### Files Modified
1. **BottomNavigation.tsx**
   - Added `useRef` hook to track DOM elements
   - Implemented `handleClick` function to create ripple elements dynamically
   - Applies appropriate CSS class based on `isActive` state

2. **BottomNavigation.module.css**
   - Added `.ripple` base class with animation
   - Added `.ripplePrimary` for switching tabs (green)
   - Added `.rippleDisabled` for same tab clicks (gray)
   - Added `@keyframes rippleEffect` for scale and opacity animation
   - Added `overflow: hidden` to `.navItem` to contain ripples

### Animation Details
- **Starting state**: scale(0), opacity: 0.6
- **Ending state**: scale(4), opacity: 0
- **Easing**: ease-out
- **Duration**: 600ms
- **Cleanup**: Ripple element removed after animation completes

## Testing

### Automated Tests
Location: `web/src/components/common/BottomNavigation/__tests__/BottomNavigation.test.tsx`

Tests cover:
1. Basic rendering of navigation items
2. Active tab highlighting
3. Click handler invocation
4. Ripple element creation on click
5. Primary color application for tab switching
6. Disabled color application for same tab clicks
7. All three tabs functionality

Run tests:
```bash
cd web
pnpm test -- BottomNavigation.test.tsx
```

### Storybook Stories
Location: `web/src/components/common/BottomNavigation/BottomNavigation.stories.tsx`

Stories include:
1. **Interactive** - Demonstrates ripple effect with state management
2. **RouteActive** - Static view with route tab active
3. **BusStopActive** - Static view with bus stop tab active
4. **RecentActive** - Static view with recent tab active

Run Storybook:
```bash
cd web
pnpm run storybook
```
Visit: http://localhost:6006/?path=/story/components-common-bottomnavigation--interactive

## Manual Testing
1. Start the dev server: `pnpm dev` (from project root)
2. Navigate to any page with the bottom navigation
3. Click on different tabs to see the green ripple
4. Click on the same tab again to see the gray ripple

## Color References
- **Primary Accent**: `--primaryaccent` → `#d0e5ce` (light green)
- **Background L2**: `--backgroundl2` → `#e2e2e2` (light gray)

Both colors support dark mode with appropriate overrides defined in `globals.css`.
