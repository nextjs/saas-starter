import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/e2e/**/*.spec.ts'],
    exclude: ['node_modules', '.next'],
    testTimeout: 60000,
    hookTimeout: 60000,
    env: {
      BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
