/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    "no-var": "error",
    "semi": "error",
    "@typescript-eslint/no-var-requires": 0,
    "vue/multi-word-component-names": ["error", {
      "ignores": ['Home', 'Settings']
    }]
  }
};
