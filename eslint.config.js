import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
    { ignores: ['dist', 'node_modules'] },
    js.configs.recommended,
    react.configs.flat.recommended,
    /** @see eslint-plugin-react-hooks — flat preset is `recommended-latest` */
    reactHooks.configs['recommended-latest'],
    {
        files: ['src/**/*.{js,jsx}'],
        plugins: {
            'react-refresh': reactRefresh,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                __PM_ANTHROPIC_KEY__: 'readonly',
            },
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-refresh/only-export-components': 'off',
        },
    },
];
