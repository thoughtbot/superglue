import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock(import('../../lib/config.ts'), () => {
  const current = {
    baseUrl: 'https://example.com',
    maxPages: 20,
  }
  return {
    setConfig: (patch) => Object.assign(current, patch),
    getConfig: () => current,
  }
})
