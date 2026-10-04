import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React Testing Library mounts into a container that is not torn down on its own
// when `globals: true` is used without the auto-cleanup entry point.
afterEach(() => {
  cleanup()
})

// Chakra UI reads matchMedia for its color-mode and responsive hooks; jsdom does
// not implement it. Without this stub every component test that renders a Chakra
// component throws before the first assertion.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
