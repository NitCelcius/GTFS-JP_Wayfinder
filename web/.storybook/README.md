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

Stories are organized by domain and component type using the naming convention described below.

## Adding New Stories

To add a story for a new component:

1. Create a `ComponentName.stories.tsx` file next to your component
2. Use the established pattern:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Domain/YourComponent', // Follow naming convention below
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

3. Follow the naming convention:
- If the component is internal and intended for use with only a particular parent component, name it `[Domain]/[ParentComponentName]/Internal/[ComponentName]`
- If the component is located at common directory and intended for generic use, name it `Common/[ComponentName]`
- If the component is a page component, name it `Page/[Path/to/page]`
- Otherwise, name it `[Domain]/[ComponentName]`

## Troubleshooting

### Path Resolution

If you encounter import issues, ensure that the `@/*` path alias is properly configured in `.storybook/main.ts`.

### CSS Modules

CSS modules are automatically supported. Make sure your `*.module.css` files are correctly imported in your components.