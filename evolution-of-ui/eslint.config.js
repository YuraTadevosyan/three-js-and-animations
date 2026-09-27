import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import { qwikEslint9Plugin } from 'eslint-plugin-qwik'

export default tseslint.config(
  globalIgnores(['**/dist', '**/server', '**/tmp', '**/node_modules', '**/*.config.ts', 'eslint.config.js', 'adapters']),
  js.configs.recommended,
  tseslint.configs.recommended,
  qwikEslint9Plugin.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Every WebGPU canvas, the terminal and the window manager need the DOM,
      // and this is a static page with no server — visible tasks are the point.
      'qwik/no-use-visible-task': 'off',
    },
  },
)
