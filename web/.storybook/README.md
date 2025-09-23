# Storybook for GTFS-JP Wayfinder

This directory contains Storybook configuration and stories for the internal components in the GTFS-JP Wayfinder web application.

## Overview

Storybook is set up to showcase and develop internal components in isolation. Internal components are located in the `internal/` directories within various domain folders.

## Getting Started

### Development

To start Storybook in development mode:

```bash
cd web
pnpm storybook
```

This will start Storybook on `http://localhost:6006`.

### Building for Production

To build a static version of Storybook:

```bash
cd web
pnpm build-storybook
```

The built files will be output to `web/storybook-static/`.

## Story Organization

Stories are organized by domain and component type:

- **Internal/Route Search/**: Components for route search functionality
  - RouteOverview
  - StationStop
  
- **Internal/Bus Stop/**: Components for bus stop search and display
  - BusStopHeader
  
- **Internal/Bus Stop Search/**: Components for searching bus stops
  - SearchInput
  - BusStopItem
  
- **Internal/Recent/**: Components for recent searches
  - RecentBusStopSearches

## Component Categories

As per the project structure, components are classified as:
- **Page components**: Full page layouts
- **Common components**: Reusable across domains (in `/components/common/`)
- **Internal components**: Domain-specific internal components (in `*/internal/` directories)

This Storybook setup focuses on the internal components to provide isolated development and testing environments.

## Configuration

### Key Files

- `.storybook/main.ts`: Main Storybook configuration
- `.storybook/preview.ts`: Global preview settings and decorators
- `*.stories.tsx`: Individual component stories

### Features Enabled

- **Auto-docs**: Automatic documentation generation from JSDoc and TypeScript
- **Controls**: Interactive controls for component props
- **Actions**: Logging of component events
- **Viewport**: Responsive design testing
- **Backgrounds**: Different background options

### Styling

Storybook is configured to use the same Tailwind CSS setup as the main application, ensuring visual consistency.

## Adding New Stories

To add a story for a new internal component:

1. Create a `ComponentName.stories.tsx` file next to your component
2. Use the established pattern:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Internal/Domain/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // your component props
  },
};
```

3. Follow the naming convention: `Internal/[Domain]/[ComponentName]`

## CI/CD Integration

The Storybook build can be integrated with Vercel or other static hosting platforms by:

1. Adding build scripts to CI pipeline
2. Publishing the `storybook-static` output
3. Configuring automatic deployments

## Troubleshooting

### Path Resolution

If you encounter import issues, ensure that the `@/*` path alias is properly configured in `.storybook/main.ts`.

### CSS Modules

CSS modules are automatically supported. Make sure your `*.module.css` files are correctly imported in your components.