import type { ReactElement } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'

interface RenderWithChakraOptions extends Omit<RenderOptions, 'wrapper'> {
  /** URLs the router starts with; the last one is the active route. */
  initialEntries?: string[]
}

/**
 * Render a component inside the same providers the app mounts in `main.tsx`.
 *
 * Chakra components read theme and color-mode from context; rendering them bare
 * throws or silently loses styling, so component tests should use this instead of
 * Testing Library's `render` directly.
 *
 * The router is here for the same reason: `MainTable` renders a `Link` to the coin
 * detail route, and any component containing a link or a route hook throws outside
 * a router context. `MemoryRouter` keeps that out of every individual test — pass
 * `initialEntries` when the test is about a specific URL.
 */
export function renderWithChakra(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: RenderWithChakraOptions = {},
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => (
      <ChakraProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </ChakraProvider>
    ),
    ...options,
  })
}
