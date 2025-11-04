import type { Preview } from '@storybook/react';
import '@/app/globals.css'; // Import your global styles

// Inject environment variables for Storybook
if (typeof window !== 'undefined') {
  (window as any).__ENV__ = {
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8002',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_USE_RELATIVE_TIME: 'false',
    NODE_ENV: 'development',
    ENABLE_BASIC_AUTH: 'false',
  };
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;