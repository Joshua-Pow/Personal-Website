import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack, antiSlop],
  ignorePatterns: [
    ...core.ignorePatterns,
    "src/routeTree.gen.ts",
    "dist/**",
    ".output/**",
    ".wrangler/**",
  ],
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        // React components in this repo stay PascalCase.
        "unicorn/filename-case": "off",
      },
    },
  ],
  rules: {
    // Existing code uses `function` declarations; converting the whole tree
    // is out of scope for the Vite/TanStack migration.
    "func-style": "off",
    "react/function-component-definition": "off",
  },
});
