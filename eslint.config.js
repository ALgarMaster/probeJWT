import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
  // =============================
  // TypeScript файлы
  // =============================
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser, // <- импорт самого парсера
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'error',
    },
  },

  // =============================
  // Angular HTML шаблоны
  // =============================
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser, // <- импорт самого парсера
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {},
  },

  // =============================
  // Игнорируемые файлы/папки
  // =============================
  {
    ignores: ['node_modules/**', 'dist/**', 'src-tauri/**'],
  },
]);
