// Utility functions for API configuration debugging and validation
import { getCurrentApiBaseUrl } from "./api";
import { getEnvValue } from "./envUtils";

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
