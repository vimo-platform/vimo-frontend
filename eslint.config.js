// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "bimo_frontend-u/*", "bimo_frontend-m/*", "shared/*"],
  },
  {
    files: ["app/(user)/index.tsx", "app/_layout.tsx"],
    rules: {
      "import/no-unresolved": "off",
    },
  }
]);
