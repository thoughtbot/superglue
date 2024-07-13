import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    clearMocks: true,
    setupFiles: ['./spec/helpers/setup.js', './spec/helpers/polyfill.js'],
  },
})
