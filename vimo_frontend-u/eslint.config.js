// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/app/index.tsx", "src/app/_layout.tsx"],
    rules: {
      "import/no-unresolved": "off",
    },
  }
]);
