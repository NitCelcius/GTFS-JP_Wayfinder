import { defineConfig } from "@hey-api/openapi-ts";

export const baseConfig = {
  input: "./openapi.json",
  output: "./src/api",
};

export default defineConfig(baseConfig);
