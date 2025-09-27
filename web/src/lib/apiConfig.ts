// Utility functions for API configuration debugging and validation
import { getCurrentApiBaseUrl } from "./api";

/**
 * Debug utility to log current API configuration
 */
export function logApiConfig(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔧 API Configuration');
    console.log('Base URL:', getCurrentApiBaseUrl());
    console.log('Environment:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
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
    environment: process.env.NODE_ENV,
  };
}