/**
 * Hook to safely access environment variables in both Next.js and Storybook contexts.
 * This hook provides a unified interface for accessing environment variables that works
 * in both server-side rendering (Next.js) and client-side Storybook environments.
 *
 * For Storybook, environment variables should be defined in .storybook/preview.ts
 * using the `env` parameter or by setting them in the story context.
 */

import { useMemo } from "react";

/**
 * Environment variable configuration type
 */
export interface EnvConfig {
  /** Base URL for API requests (default: http://localhost:8002) */
  NEXT_PUBLIC_API_BASE_URL?: string;
  /** Base URL for the application, used for sharing links (default: current origin or http://localhost:3000) */
  NEXT_PUBLIC_BASE_URL?: string;
  /** Enable relative time display (e.g., "5 minutes" vs "10:30") (default: false) */
  NEXT_PUBLIC_USE_RELATIVE_TIME?: string;
  /** Node environment (development, production, test) */
  NODE_ENV?: string;
  /** Enable basic authentication (default: false) */
  ENABLE_BASIC_AUTH?: string;
  /** Basic auth username */
  BASIC_AUTH_USERNAME?: string;
  /** Basic auth password */
  BASIC_AUTH_PASSWORD?: string;
}

/**
 * Default environment values used as fallbacks
 */
const DEFAULT_ENV: EnvConfig = {
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8002",
  NEXT_PUBLIC_BASE_URL:
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  NEXT_PUBLIC_USE_RELATIVE_TIME: "false",
  NODE_ENV: "development",
  ENABLE_BASIC_AUTH: "false",
};

/**
 * Extends Window interface to include __ENV__ for Storybook
 */
declare global {
  interface Window {
    __ENV__?: EnvConfig;
  }
}

/**
 * Get environment variable value with fallback
 * This function checks multiple sources in order:
 * 1. window.__ENV__ (for Storybook or runtime injection)
 * 2. process.env (for Next.js build-time substitution)
 * 3. Default values
 */
function getEnvValue(key: keyof EnvConfig): string | undefined {
  // Check if running in browser with injected env
  if (typeof window !== "undefined" && window.__ENV__) {
    const value = window.__ENV__[key];
    if (value !== undefined) return value;
  }

  // Check process.env (works in Next.js)
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value !== undefined) return value;
  }

  // Return default value
  return DEFAULT_ENV[key];
}

/**
 * Hook to access environment variables safely in both Next.js and Storybook.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const env = useEnv();
 *   const apiUrl = env.NEXT_PUBLIC_API_BASE_URL;
 *   // Use apiUrl...
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In Storybook story
 * export const WithCustomEnv: Story = {
 *   parameters: {
 *     env: {
 *       NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
 *     },
 *   },
 * };
 * ```
 */
export function useEnv(): EnvConfig {
  return useMemo(() => {
    const env: EnvConfig = {};
    const keys: (keyof EnvConfig)[] = [
      "NEXT_PUBLIC_API_BASE_URL",
      "NEXT_PUBLIC_BASE_URL",
      "NEXT_PUBLIC_USE_RELATIVE_TIME",
      "NODE_ENV",
      "ENABLE_BASIC_AUTH",
      "BASIC_AUTH_USERNAME",
      "BASIC_AUTH_PASSWORD",
    ];

    keys.forEach((key) => {
      env[key] = getEnvValue(key);
    });

    return env;
  }, []);
}

/**
 * Get a specific environment variable value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const apiUrl = useEnvValue('NEXT_PUBLIC_API_BASE_URL');
 *   // Use apiUrl...
 * }
 * ```
 */
export function useEnvValue(key: keyof EnvConfig): string | undefined {
  const env = useEnv();
  return env[key];
}
