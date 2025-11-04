# Icon Directory

This directory contains all SVG icons used throughout the application. Icons are organized as individual SVG files for better maintainability and clarity.

## Available Icons

| Icon Name | Description | Usage |
|-----------|-------------|-------|
| `alert-triangle.svg` | Warning/error indicator | Error states in modals and alerts |
| `arrow-back.svg` | Back navigation arrow | TopNavigation back button |
| `arrow-down-long.svg` | Long downward arrow | Transfer arrows in route results |
| `arrow-down.svg` | Short downward arrow | Dropdown indicators |
| `arrow-right.svg` | Right arrow | Navigation and forward actions |
| `clock.svg` | Clock/time icon | Recent page, time-related features |
| `close.svg` | Close/X button | Modal close buttons |
| `flag-filled.svg` | Filled flag icon | Destination markers (filled style) |
| `flag-simple.svg` | Simple flag icon | Destination markers (simple style) |
| `flag.svg` | Flag icon | Destination markers (outline style) |
| `info.svg` | Information icon | Info pages and help sections |
| `location-dot.svg` | Location dot | Intermediate stops in journey |
| `location-filled.svg` | Filled location pin | Location markers (filled style) |
| `location-pin-simple.svg` | Simple location pin | Origin markers (simple style) |
| `location-pin.svg` | Location pin | Bus stop locations, origin markers |
| `map-search.svg` | Map with search | Map search functionality |
| `route.svg` | Route/activity line | Recent route searches |
| `search.svg` | Search magnifying glass | Search inputs and buttons |
| `share.svg` | Share icon | Share functionality |
| `swap.svg` | Swap/exchange arrows | Origin/destination swap button |
| `transfer.svg` | Transfer arrows | Transfer/route change buttons |
| `walk.svg` | Walking person | Walking directions button |

## Usage

### Using the Icon Component

The recommended way to use icons is through the `Icon` component:

```tsx
import { Icon } from "@/components/common";

// Basic usage
<Icon name="search" size={24} />

// With className
<Icon name="location-pin" className="w-6 h-6" />

// With inline style
<Icon name="arrow-back" size={32} style={{ color: 'blue' }} />
```

### Direct Usage with img Tag

You can also use icons directly with the `img` tag:

```tsx
<img src="/icons/search.svg" alt="" className="w-6 h-6" aria-hidden="true" />
```

## Icon Design Guidelines

- All icons use `currentColor` for stroke/fill to inherit text color
- Icons are designed to work at multiple sizes (typically 16px, 24px, 32px)
- SVG viewBox is optimized for each icon's design
- Icons include proper accessibility attributes (`aria-hidden="true"`)

## Adding New Icons

When adding new icons to this directory:

1. Name the file descriptively using kebab-case (e.g., `new-icon.svg`)
2. Ensure the SVG uses `currentColor` for dynamic theming
3. Include proper viewBox attributes
4. Test the icon at multiple sizes (16px, 24px, 32px, 40px)
5. Update this README with the new icon
6. Consider creating wrapper components for complex icons

## Migration Notes

These icons were previously defined inline within component files. They have been extracted to:
- Improve code clarity
- Enable easier icon management
- Reduce bundle size through asset optimization
- Allow better icon reuse across components
