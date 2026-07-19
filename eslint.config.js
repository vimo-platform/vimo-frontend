// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "vimo_frontend-u/*", "vimo_frontend-m/*", "shared/*"],
  },
  {
    files: ["app/(user)/index.tsx", "app/_layout.tsx"],
    rules: {
      "import/no-unresolved": "off",
    },
  }
]);
