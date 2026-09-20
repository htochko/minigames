import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Global options
  {
    linterOptions: {
      noInlineConfig: true, // Disables inline comments like /* eslint-disable */
    },
  },
  // Recommended JavaScript rules
  js.configs.recommended,
  
  // Recommended TypeScript rules
  ...tseslint.configs.recommended,
  
  // Recommended Unicorn rules (native flat config support)
  eslintPluginUnicorn.configs['flat/recommended'],
  
  // Custom rules & project configuration for TS files
  // alternative pattern 'src/**/*.{ts,tsx,js,jsx}'
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Enforce no-explicit-any explicitly
      '@typescript-eslint/no-explicit-any': 'error',
      'unicorn/no-empty-file': 'off',
    },
  },
  // Disables ESLint formatting rules that conflict with Prettier (Must be last)
  eslintConfigPrettier,
];