import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Capitalized names are components rendered as JSX (e.g. `icon: Icon` → <Icon />),
      // which core no-unused-vars can't see.
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^[A-Z_]" },
      ],
    },
  },
  {
    // Unit tests run in Node (node --test)
    files: ["**/*.test.js"],
    languageOptions: { globals: globals.node },
  },
  {
    // Context modules export a Provider alongside its use* hook; shadcn/ui
    // modules export class helpers (buttonVariants) next to components.
    files: ["src/context/**/*.{js,jsx}", "src/components/ui/**/*.{js,jsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
