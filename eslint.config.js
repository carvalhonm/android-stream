// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    rules: {
      "prefer-template": "warn",
      "no-useless-concat": "warn",
    },
    ignores: ["dist/*"],
  },
]);
