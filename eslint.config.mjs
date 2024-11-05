import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginNode from 'eslint-plugin-node';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    plugins: {
      prettier: eslintPluginPrettier,
      node: eslintPluginNode,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          endOfLine: 'auto',
          trailingComma: 'es5',
          printWidth: 120,
          tabWidth: 2,
          semi: true,
        },
      ],
      'node/no-missing-import': 'error',
      'node/no-extraneous-import': 'off',
      'node/no-unpublished-import': 'off',
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 4],
      complexity: ['error', 10],
      camelcase: ['error', { properties: 'never' }],
      'no-underscore-dangle': 'off',
      'arrow-body-style': ['error', 'as-needed'],
      'no-param-reassign': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  prettier,
];
