// @ts-check

import tseslint from 'typescript-eslint';
import baseConfigs from './base.js';

export default tseslint.config(...baseConfigs, {
  rules: {
    strictNullChecks: 0,
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'sonarjs/prefer-nullish-coalescing': 'off',
  },
});
