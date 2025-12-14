/**
 * Shared environment variable constants
 * This module contains default values used as fallbacks for optional environment variables
 */

/**
 * Default environment values used as fallbacks for optional environment variables
 */
export const DEFAULT_ENV_VALUES: Record<string, string> = {
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8002",
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
  NEXT_PUBLIC_USE_RELATIVE_TIME: "false",
  ENABLE_BASIC_AUTH: "false",
};
