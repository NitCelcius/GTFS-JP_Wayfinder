// Utility functions for API configuration debugging and validation
import { getCurrentApiBaseUrl } from "./api";

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
 */
function getEnvValue(key: string, defaultValue: string): string {
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

  return defaultValue;
}

/**
 * Debug utility to log current API configuration
 */
export function logApiConfig(): void {
  const nodeEnv = getEnvValue("NODE_ENV", "development");
  if (nodeEnv === "development") {
    console.group("🔧 API Configuration");
    console.log("Base URL:", getCurrentApiBaseUrl());
    console.log("Environment:", nodeEnv);
    console.log(
      "NEXT_PUBLIC_API_BASE_URL:",
      getEnvValue("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8002")
    );
    console.groupEnd();
  }
}

/**
 * Check if API base URL is properly configured
 */
export function validateApiConfig(): boolean {
  const baseUrl = getCurrentApiBaseUrl();

  try {
    new URL(baseUrl);
    return true;
  } catch {
    console.error(`❌ Invalid API Base URL: ${baseUrl}`);
    return false;
  }
}

/**
 * Get API configuration for runtime use
 */
export function getApiConfig() {
  return {
    baseUrl: getCurrentApiBaseUrl(),
    isValid: validateApiConfig(),
    environment: getEnvValue("NODE_ENV", "development"),
  };
}
