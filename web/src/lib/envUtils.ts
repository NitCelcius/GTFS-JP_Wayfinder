/**
 * Utility functions for accessing environment variables in both Next.js and Storybook contexts
 * This module provides non-hook functions for module-level code that can't use React hooks.
 */
import type { ValidEnvKey } from "@/hooks/useEnv";
import { DEFAULT_ENV_VALUES } from "./envConstants";

/**
 * Extends Window interface to include __ENV__ for Storybook
 */
declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>;
  }
}

/**
 * Get environment variable value with fallback (non-hook version for module-level code)
 * This function checks multiple sources in order:
 * 1. window.__ENV__ (for Storybook or runtime injection)
 * 2. process.env (for Next.js build-time substitution)
 * 3. Default value parameter or built-in defaults
 *
 * For type-safe access within React components, use the useEnv hook instead.
 *
 * @param key - The environment variable key
 * @param defaultValue - The default value if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnvValue(key: ValidEnvKey, defaultValue?: string): string {
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

  // Return provided default or built-in default
  if (defaultValue !== undefined) return defaultValue;

  const builtInDefault = DEFAULT_ENV_VALUES[key];
  if (builtInDefault !== undefined) return builtInDefault;

  return "";
}
