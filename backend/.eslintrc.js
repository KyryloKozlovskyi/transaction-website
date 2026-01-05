module.exports = {
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "no-console": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_|^next" }],
  },
  ignorePatterns: [
    "node_modules/",
    "coverage/",
    "build/",
    "dist/",
    "*.test.js",
  ],
};
