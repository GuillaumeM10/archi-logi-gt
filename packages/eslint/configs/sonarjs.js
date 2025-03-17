// @ts-check

import { fixupPluginRules } from '@eslint/compat';
import sonarjsPlugin from 'eslint-plugin-sonarjs';

import tseslint from 'typescript-eslint';

export default tseslint.config({
  plugins: {
    sonarjs: fixupPluginRules(sonarjsPlugin),
  },
  rules: {
    ...sonarjsPlugin.configs.recommended.rules,
    'sonarjs/cognitive-complexity': 1,
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/no-identical-functions': 'off',

    'sonarjs/redundant-type-aliases': 'off',

    'sonarjs/no-redeclare': 'off',

    'sonarjs/sonar-no-fallthrough': 'off',
  },
});
