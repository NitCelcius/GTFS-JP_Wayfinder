/**
 * Environment variable schema. Define all env variables here
 */

type RequiredEnvVar = {
  readonly required: true;
};

type OptionalEnvVar<TDefault extends string = never> = {
  readonly required: false;
  readonly default?: TDefault;
};

export const ENV_SCHEMA = {
  // Required variables
  NEXT_PUBLIC_API_BASE_URL: {
    required: true,
  } as const satisfies RequiredEnvVar,
  NEXT_PUBLIC_BASE_URL: { required: true } as const satisfies RequiredEnvVar,

  // Optional variables
  NEXT_PUBLIC_USE_RELATIVE_TIME: {
    required: false,
    default: "false",
  } as const satisfies OptionalEnvVar<"false">,
  NODE_ENV: {
    required: false,
    default: "development",
  } as const satisfies OptionalEnvVar<"development">,
  ENABLE_BASIC_AUTH: {
    required: false,
    default: "false",
  } as const satisfies OptionalEnvVar<"false">,

  // Optional variables without defaults
  BASIC_AUTH_USERNAME: { required: false } as const satisfies OptionalEnvVar,
  BASIC_AUTH_PASSWORD: { required: false } as const satisfies OptionalEnvVar,
} as const;

export type ValidEnvKey = keyof typeof ENV_SCHEMA;

/**
 * Derive EnvConfig type from schema
 * - Required vars → always string
 * - Optional with default → string (the default type)
 * - Optional without default → string | undefined
 */
export type EnvConfig = {
  [K in ValidEnvKey]: (typeof ENV_SCHEMA)[K] extends { required: true }
    ? string
    : (typeof ENV_SCHEMA)[K] extends { default: infer D extends string }
      ? D
      : string | undefined;
};

/**
 * Type guard: check if a key is required
 */
export function isRequiredKey(key: ValidEnvKey): boolean {
  return ENV_SCHEMA[key].required;
}

/**
 * Get the default value for a key, if it exists
 */
export function getSchemaDefault(key: ValidEnvKey): string | undefined {
  const config = ENV_SCHEMA[key];
  return "default" in config ? config.default : undefined;
}
