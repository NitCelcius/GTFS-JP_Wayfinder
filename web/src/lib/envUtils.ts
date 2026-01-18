/**
 * Utility functions for accessing environment variables in both Next.js and Storybook contexts
 * This module provides non-hook functions for module-level code that can't use React hooks.
 */
import {
  ENV_SCHEMA,
  type ValidEnvKey,
  getSchemaDefault,
  isRequiredKey,
} from "./envSchema";

/**
 * Extends Window interface to include __ENV__ for Storybook
 */
declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>;
  }
}

export type { ValidEnvKey };

/**
 * Get Vercel-derived URL for the current deployment.
 * Returns undefined if not running on Vercel.
 */
const getVercelUrl = (): string | undefined => {
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }
  // VERCEL_URL is the deployment URL without protocol (e.g., "my-app-123.vercel.app")
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return undefined;
};

const getNextEnvValue = (key: ValidEnvKey): string | undefined => {
  // Only access process if it exists (guards against Storybook SSR or browser context)
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }

  switch (key) {
    case "NEXT_PUBLIC_API_BASE_URL": {
      const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (explicit) return explicit;

      // Auto-derive from Vercel URL (API is at /api path)
      const vercelUrl = getVercelUrl();
      if (vercelUrl) return `${vercelUrl}/api`;

      return undefined;
    }
    case "NEXT_PUBLIC_BASE_URL": {
      const explicit = process.env.NEXT_PUBLIC_BASE_URL;
      if (explicit) return explicit;

      // Auto-derive from Vercel URL
      const vercelUrl = getVercelUrl();
      if (vercelUrl) return vercelUrl;

      return undefined;
    }
    case "NEXT_PUBLIC_USE_RELATIVE_TIME": {
      return process.env.NEXT_PUBLIC_USE_RELATIVE_TIME;
    }
    case "NEXT_PUBLIC_MINIMUM_DIST_INDICATOR": {
      return process.env.NEXT_PUBLIC_MINIMUM_DIST_INDICATOR;
    }
    case "NODE_ENV": {
      return process.env.NODE_ENV;
    }
    case "ENABLE_BASIC_AUTH": {
      return process.env.ENABLE_BASIC_AUTH;
    }
    case "BASIC_AUTH_USERNAME": {
      return process.env.BASIC_AUTH_USERNAME;
    }
    case "BASIC_AUTH_PASSWORD": {
      return process.env.BASIC_AUTH_PASSWORD;
    }
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
};

/**
 * Get environment variable value with fallback (non-hook version for module-level code)
 * This function checks multiple sources in order:
 * 1. window.__ENV__ (for Storybook or runtime injection)
 * 2. process.env (for Next.js build-time substitution)
 * 3. Schema default value or provided default
 *
 * For type-safe access within React components, use the useEnv hook instead.
 *
 * @param key - The environment variable key
 * @param defaultValue - Optional override for the default value
 * @returns The environment variable value, default, or undefined
 */
export function getEnvValue(
  key: ValidEnvKey,
  defaultValue?: string
): string | undefined {
  // Check if running in browser with injected env
  if (typeof window !== "undefined" && window.__ENV__) {
    const value = window.__ENV__[key];
    if (value !== undefined) return value;
  }

  if (typeof process !== "undefined" && process.env) {
    const value = getNextEnvValue(key);
    if (value !== undefined) return value;
  }

  // Return provided override, schema default, or undefined
  if (defaultValue !== undefined) return defaultValue;

  return getSchemaDefault(key);
}

/**
 * Validate that all required environment variables are provided
 * @throws Error if any required variable is missing
 */
export function validateRequiredEnv(): void {
  const missing: ValidEnvKey[] = [];

  for (const key of Object.keys(ENV_SCHEMA) as ValidEnvKey[]) {
    if (isRequiredKey(key) && !getEnvValue(key)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
