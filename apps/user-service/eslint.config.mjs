import rootEslintConfig from '../../eslint.config.mjs';

export default [
  ...rootEslintConfig, // This imports all the rules from the root config
  {
    // Override or add specific rules for `user-service`
    rules: {
      // Example: Disable the max-lines rule specifically for this service
      'max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],

      // You can override or add other rules as needed
      // 'no-console': 'warn', // Change this to warn only in `user-service`
    },
  },
];
