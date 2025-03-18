import eslintReactConfig from '@archi-logi-gt/eslint-config/react.js';

export default [
  ...eslintReactConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
];
