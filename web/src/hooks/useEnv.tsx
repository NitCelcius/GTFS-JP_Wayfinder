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
import { type ValidEnvKey, getEnvValue } from "@/lib/envUtils";

export type { ValidEnvKey };

/**
 * Environment variable configuration type
 * - Required fields: guaranteed to be strings (have defaults)
 * - Optional fields: may be undefined (no fallback defaults)
 */
export interface EnvConfig {
  // Required environment variables (always defined)
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_USE_RELATIVE_TIME: string;
  NODE_ENV: string;
  ENABLE_BASIC_AUTH: string;

  // Optional environment variables (may be undefined)
  BASIC_AUTH_USERNAME: string | undefined;
  BASIC_AUTH_PASSWORD: string | undefined;
}

/**
 * Overrides for environment values, keyed by ValidEnvKey.
 * Consumers should provide concrete string values; omit keys to fall back to defaults.
 */
export type EnvOverrides = Partial<Record<ValidEnvKey, string>>;

/**
 * Build a complete environment configuration from the available sources
 * @param overrides - Optional overrides for specific environment values
 * @returns Complete EnvConfig object with all required and optional variables
 */
function buildEnv(overrides?: EnvOverrides): EnvConfig {
  return {
    NEXT_PUBLIC_API_BASE_URL:
      overrides?.NEXT_PUBLIC_API_BASE_URL ??
      getEnvValue("NEXT_PUBLIC_API_BASE_URL") ??
      DEFAULT_ENV_VALUES.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8002",
    NEXT_PUBLIC_BASE_URL:
      overrides?.NEXT_PUBLIC_BASE_URL ??
      getEnvValue("NEXT_PUBLIC_BASE_URL") ??
      DEFAULT_ENV_VALUES.NEXT_PUBLIC_BASE_URL ??
      "http://localhost:3000",
    NEXT_PUBLIC_USE_RELATIVE_TIME:
      overrides?.NEXT_PUBLIC_USE_RELATIVE_TIME ??
      getEnvValue("NEXT_PUBLIC_USE_RELATIVE_TIME") ??
      DEFAULT_ENV_VALUES.NEXT_PUBLIC_USE_RELATIVE_TIME ??
      "false",
    NODE_ENV:
      overrides?.NODE_ENV ??
      getEnvValue("NODE_ENV") ??
      DEFAULT_ENV_VALUES.NODE_ENV ??
      "development",
    ENABLE_BASIC_AUTH:
      overrides?.ENABLE_BASIC_AUTH ??
      getEnvValue("ENABLE_BASIC_AUTH") ??
      DEFAULT_ENV_VALUES.ENABLE_BASIC_AUTH ??
      "false",
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
  const envConfig = useMemo(
    () => (value ? value : buildEnv(overrides)),
    [value, overrides]
  );

  return (
    <EnvContext.Provider value={envConfig}>{children}</EnvContext.Provider>
  );
};

/**
 * Hook to access environment variables safely in both Next.js and Storybook.
 * Falls back to building env config if no provider is found in the component tree.
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
