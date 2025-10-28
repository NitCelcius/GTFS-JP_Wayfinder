// Utility functions for API configuration debugging and validation
import { getCurrentApiBaseUrl } from "./api";

// Safe check for process.env in browser contexts
const getNodeEnv = () => {
  if (typeof process !== "undefined" && process.env) {
    return process.env.NODE_ENV;
  }
  return "production";
};

const getPublicApiBaseUrl = () => {
  if (typeof process !== "undefined" && process.env) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return undefined;
};

/**
 * Debug utility to log current API configuration
 */
export function logApiConfig(): void {
  if (getNodeEnv() === "development") {
    console.group("🔧 API Configuration");
    console.log("Base URL:", getCurrentApiBaseUrl());
    console.log("Environment:", getNodeEnv());
    console.log("NEXT_PUBLIC_API_BASE_URL:", getPublicApiBaseUrl());
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
    environment: getNodeEnv(),
  };
}
