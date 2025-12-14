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

import { ENV_SCHEMA, type EnvConfig, type ValidEnvKey } from "@/lib/envSchema";
import { getEnvValue } from "@/lib/envUtils";

export type { ValidEnvKey, EnvConfig };

/**
 * Overrides for environment values, keyed by ValidEnvKey.
 * Consumers should provide concrete string values; omit keys to fall back to defaults.
 */
export type EnvOverrides = Partial<Record<ValidEnvKey, string>>;

/**
 * Build a complete environment configuration from the available sources
 * @param overrides - Optional overrides for specific environment values
 * @returns Complete EnvConfig object with all required and optional variables
 * @throws Error if required variables are missing
 */
function buildEnv(overrides?: EnvOverrides): EnvConfig {
  const config: Record<string, unknown> = {};

  for (const key of Object.keys(ENV_SCHEMA) as ValidEnvKey[]) {
    const overrideValue = overrides?.[key];
    const envValue = getEnvValue(key);
    const resolvedValue = overrideValue ?? envValue;

    // Validate required variables are present
    if (ENV_SCHEMA[key].required && !resolvedValue) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    config[key] = resolvedValue;
  }

  return config as EnvConfig;
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
