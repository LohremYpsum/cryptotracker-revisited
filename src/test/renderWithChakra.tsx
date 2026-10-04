import type { ReactElement } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'

/**
 * Render a component inside the same ChakraProvider the app mounts in `main.tsx`.
 *
 * Chakra components read theme and color-mode from context; rendering them bare
 * throws or silently loses styling, so component tests should use this instead of
 * Testing Library's `render` directly.
 */
export function renderWithChakra(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => <ChakraProvider>{children}</ChakraProvider>,
    ...options,
  })
}
