import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import eslint from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "eslint:recommended",
    "plugin:@typescript-eslint/recommended"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next/static/**",
      "src/api/**",
      "src/**/client.gen.*",
      "src/**/*.gen.*",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/**/*.{js,ts,jsx,tsx}", "app/**/*.{js,ts,jsx,tsx}"],
    rules: {
      "no-console": "off",
    },
  },

];

export default eslintConfig;
