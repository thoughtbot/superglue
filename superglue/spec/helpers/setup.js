import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock(import('../../lib/config.ts'), () => {
  return {
    config: {
      baseUrl: 'https://example.com',
      maxPages: 20,
    },
  }
})
