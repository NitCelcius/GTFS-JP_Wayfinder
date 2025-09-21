import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
