import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import { dirname } from "path";
import { fileURLToPath } from "url";

import limitInlineStylesRule from "./eslint-rules/limit-inline-styles.js";
import noDirectEnvAccessRule from "./eslint-rules/no-direct-env-access.js";
import requireCssModulesRule from "./eslint-rules/require-css-modules.js";
import unusedCssModuleClassesRule from "./eslint-rules/unused-css-module-classes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ),
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
      "storybook-static/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/**/*.{js,ts,jsx,tsx}", "app/**/*.{js,ts,jsx,tsx}"],
    rules: {
      "no-console": "off",
    },
  },
  {
    // Enforce CSS Modules across the web/ codebase except for allowed globals
    files: ["src/**/*.{js,ts,jsx,tsx}", "app/**/*.{js,ts,jsx,tsx}"],
    plugins: {
      local: {
        rules: {
          "require-css-modules": requireCssModulesRule,
          "limit-inline-styles": limitInlineStylesRule,
          "unused-css-module-classes": unusedCssModuleClassesRule,
          "no-direct-env-access": noDirectEnvAccessRule,
        },
      },
    },
    rules: {
      "local/require-css-modules": [
        "error",
        {
          allow: ["globals.css", "./globals.css"],
        },
      ],
      "local/limit-inline-styles": [
        "warn",
        {
          maxUtilityClasses: 4,
          allowPatterns: [
            "^w-\\d+", // width utilities like w-6
            "^h-\\d+", // height utilities like h-6
            "^flex$",
            "^items-center$",
            "^justify-center$",
            "^text-[^\n]+$", // arbitrary text sizes
            "^rounded[^s]*$", // pattern for rounded / rounded-lg etc.
          ],
          allowHexInFiles: [
            "globals.css", // we already import tokens there; guard mainly JSX
          ],
        },
      ],
      "local/unused-css-module-classes": [
        "warn",
        {
          // Optionally ignore classes like container, root which are ubiquitous
          ignore: ["root", "container"],
          ignoreUnusedPatterns: ["^_"], // allow prefix underscore private classes without usage
          reportUnused: true,
          alwaysReportUnused: false,
          maxSilentUnused: 50, // do not spam if a huge shared module is imported but unused
        },
      ],
      "local/no-direct-env-access": "error",
    },
  },
];

export default eslintConfig;
