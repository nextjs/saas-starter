import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    env: {
      AUTH_SECRET: 'test-secret-key-for-testing-purposes-only-32-chars-minimum',
      STRIPE_SECRET_KEY: 'sk_test_mock_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_mock_secret',
      BASE_URL: 'http://localhost:3000',
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.config.*',
        '**/setup.ts',
        '**/seed.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
