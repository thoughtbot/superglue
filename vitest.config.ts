import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    clearMocks: true,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./spec/helpers/setup.js', './spec/helpers/polyfill.js'],
    typecheck: {
      enabled: true,
      include: ['spec/**/*.test-d.ts'],
      // The root tsconfig only covers lib/, so point tsc at one that also
      // includes the type tests.
      tsconfig: './tsconfig.spec.json',
    },
  },
})
