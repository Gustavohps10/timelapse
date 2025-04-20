import js from '@eslint/js'
import globals from 'globals'
import ts from '@typescript-eslint/eslint-plugin'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginImport from 'eslint-plugin-import'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'
import parser from '@typescript-eslint/parser'

export default defineConfig({
  ignores: ['node_modules', 'dist', 'out', '.gitignore'],
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: parser, // Usando o parser correto para TypeScript
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      tsx: true, // Para lidar com arquivos .tsx
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  plugins: {
    js,
    react: pluginReact,
    'react-hooks': pluginReactHooks,
    import: pluginImport,
    'jsx-a11y': pluginJsxA11y,
    prettier,
  },
  rules: {
    'react/self-closing-comp': 'error',
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'all',
        arrowParens: 'always',
        semi: false,
        endOfLine: 'auto',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/alt-text': [
      'warn',
      {
        elements: ['img'],
        img: ['Image'],
      },
    ],
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'react/no-unknown-property': 'error',
  },
})
