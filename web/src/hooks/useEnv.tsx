/**
 * Hook to safely access environment variables in both Next.js and Storybook contexts.
 * This hook provides a unified interface for accessing environment variables that works
 * in both server-side rendering (Next.js) and client-side Storybook environments.
 *
 * For Storybook, environment variables should be defined in .storybook/preview.ts
 * using the `env` parameter or by setting them in the story context.
 */
import React, {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";

import { DEFAULT_ENV_VALUES } from "@/lib/envConstants";

/**
 * Extends Window interface to include __ENV__ for Storybook
 */
declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>;
  }
}

/**
 * Required environment variables (always defined with defaults)
 * Used to derive the RequiredEnvKey type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENV_KEYS_REQUIRED = {
  NEXT_PUBLIC_API_BASE_URL: "NEXT_PUBLIC_API_BASE_URL",
  NEXT_PUBLIC_BASE_URL: "NEXT_PUBLIC_BASE_URL",
  NEXT_PUBLIC_USE_RELATIVE_TIME: "NEXT_PUBLIC_USE_RELATIVE_TIME",
  NODE_ENV: "NODE_ENV",
  ENABLE_BASIC_AUTH: "ENABLE_BASIC_AUTH",
} as const;

/**
 * Optional environment variables (may be undefined if not set)
 * Used to derive the OptionalEnvKey type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENV_KEYS_OPTIONAL = {
  BASIC_AUTH_USERNAME: "BASIC_AUTH_USERNAME",
  BASIC_AUTH_PASSWORD: "BASIC_AUTH_PASSWORD",
} as const;

// Derive types from env key objects
type RequiredEnvKey = keyof typeof ENV_KEYS_REQUIRED;
type OptionalEnvKey = keyof typeof ENV_KEYS_OPTIONAL;

/**
 * Type-safe environment variable key (both required and optional)
 * Use this when you need to reference valid env keys
 */
export type ValidEnvKey = RequiredEnvKey | OptionalEnvKey;

/**
 * Environment variable configuration type
 * - Required fields: guaranteed to be strings (have defaults)
 * - Optional fields: may be undefined (no fallback defaults)
 */
export interface EnvConfig {
  // Required environment variables (always defined)
  NEXT_PUBLIC_API_BASE_URL: string;
  // TODO: This env value is mandatory for proper functioning
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_USE_RELATIVE_TIME: string;
  NODE_ENV: string;
  ENABLE_BASIC_AUTH: string;

  // Optional environment variables (may be undefined)
  BASIC_AUTH_USERNAME: string | undefined;
  BASIC_AUTH_PASSWORD: string | undefined;
}

/**
 * Default values for required environment variables only
 * Imported from shared constants to maintain single source of truth
 */
const DEFAULT_ENV: Record<RequiredEnvKey, string> = {
  NEXT_PUBLIC_API_BASE_URL: DEFAULT_ENV_VALUES.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_BASE_URL: DEFAULT_ENV_VALUES.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_USE_RELATIVE_TIME:
    DEFAULT_ENV_VALUES.NEXT_PUBLIC_USE_RELATIVE_TIME,
  NODE_ENV: DEFAULT_ENV_VALUES.NODE_ENV,
  ENABLE_BASIC_AUTH: DEFAULT_ENV_VALUES.ENABLE_BASIC_AUTH,
};

/**
 * Get environment variable value with fallback
 * - Required keys: return default if not found
 * - Optional keys: return undefined if not found
 */
function getEnvValue(key: ValidEnvKey): string | undefined {
  // Check if running in browser with injected env
  if (typeof window !== "undefined" && window.__ENV__) {
    const value = window.__ENV__[key];
    if (value !== undefined) return value;
  }

  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value !== undefined) return value;
  }

  // For required keys, return default; for optional, return undefined
  if (key in DEFAULT_ENV) {
    return DEFAULT_ENV[key as RequiredEnvKey];
  }

  return undefined;
}

function getRequiredEnv(key: RequiredEnvKey): string {
  const value = getEnvValue(key);
  if (value !== undefined) {
    return value;
  }

  return DEFAULT_ENV[key];
}

/**
 * Overrides for environment values, keyed by ValidEnvKey.
 * Consumers should provide concrete string values; omit keys to fall back to defaults.
 */
export type EnvOverrides = Partial<Record<ValidEnvKey, string>>;

/**
 * Build a complete environment configuration from the available sources
 */
export function buildEnv(overrides?: EnvOverrides): EnvConfig {
  return {
    NEXT_PUBLIC_API_BASE_URL:
      overrides?.NEXT_PUBLIC_API_BASE_URL ??
      getRequiredEnv("NEXT_PUBLIC_API_BASE_URL"),
    NEXT_PUBLIC_BASE_URL:
      overrides?.NEXT_PUBLIC_BASE_URL ?? getRequiredEnv("NEXT_PUBLIC_BASE_URL"),
    NEXT_PUBLIC_USE_RELATIVE_TIME:
      overrides?.NEXT_PUBLIC_USE_RELATIVE_TIME ??
      getRequiredEnv("NEXT_PUBLIC_USE_RELATIVE_TIME"),
    NODE_ENV: overrides?.NODE_ENV ?? getRequiredEnv("NODE_ENV"),
    ENABLE_BASIC_AUTH:
      overrides?.ENABLE_BASIC_AUTH ?? getRequiredEnv("ENABLE_BASIC_AUTH"),
    BASIC_AUTH_USERNAME:
      overrides?.BASIC_AUTH_USERNAME ?? getEnvValue("BASIC_AUTH_USERNAME"),
    BASIC_AUTH_PASSWORD:
      overrides?.BASIC_AUTH_PASSWORD ?? getEnvValue("BASIC_AUTH_PASSWORD"),
  };
}

/**
 * React context used to expose environment configuration
 */
const EnvContext = createContext<EnvConfig | null>(null);

/**
 * Props for EnvProvider component
 */
export interface EnvProviderProps {
  children: ReactNode;
  /**
   * Optional overrides for environment values. Useful in Storybook to pin feature flags.
   */
  overrides?: EnvOverrides;
  /**
   * Directly provide an environment value. Takes precedence if both `value` and `overrides` are provided.
   */
  value?: EnvConfig;
}

/**
 * Provider component for environment configuration.
 * Allows overriding environment variables for different contexts (e.g., Storybook stories).
 */
export const EnvProvider: React.FC<EnvProviderProps> = ({
  children,
  value,
  overrides,
}) => {
  const envConfig = useMemo(() => {
    if (value) {
      return value;
    }
    return buildEnv(overrides);
  }, [value, overrides]);

  return (
    <EnvContext.Provider value={envConfig}>{children}</EnvContext.Provider>
  );
};

/**
 * Hook to access environment variables safely in both Next.js and Storybook.
 */
export function useEnv(): EnvConfig {
  const context = useContext(EnvContext);
  const fallbackEnv = useMemo(() => buildEnv(), []);

  return context ?? fallbackEnv;
}

/**
 * Get a specific environment variable value
 */
export function useEnvValue<K extends ValidEnvKey>(key: K): EnvConfig[K] {
  const env = useEnv();
  return env[key];
}
