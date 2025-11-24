/**
 * Shared environment variable constants
 * This module contains default values used by both useEnv hook and envUtils
 */

/**
 * Default environment values used as fallbacks for required environment variables
 */
export const DEFAULT_ENV_VALUES: Record<string, string> = {
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8002",
  NEXT_PUBLIC_BASE_URL:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
  NEXT_PUBLIC_USE_RELATIVE_TIME: "false",
  NODE_ENV: "development",
  ENABLE_BASIC_AUTH: "false",
};
