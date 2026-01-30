import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import tsParser from "@typescript-eslint/parser";

export default [
  // 1. Global Ignores
  {
    ignores: [
      ".DS_Store",
      "node_modules/**",
      "build/**",
      ".svelte-kit/**",
      "package/**",
      ".env",
      ".env.*",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
    ],
  },

  // 2. Base Configuration (JavaScript)
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2017
      },
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
  },

  // 3. TypeScript Configuration
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 4. Svelte Configuration
  ...eslintPluginSvelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".svelte"],
      },
      globals: {
        ...globals.browser,
      }
    },
    rules: {
      "svelte/no-navigation-without-resolve": "off"
    }
  },

  // 5. Disable svelte navigation rule for TS files that use goto()
  {
    files: ["**/*.ts"],
    rules: {
      "svelte/no-navigation-without-resolve": "off"
    }
  },
];