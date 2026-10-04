import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithChakra } from '../../test/renderWithChakra'
import DarkModeSwitch from './DarkModeSwitch'

// Chakra persists the colour mode in localStorage and stamps data-theme on the
// root element. Both outlive a React unmount, so without this each test would
// start in whatever mode the previous one left behind.
beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('DarkModeSwitch', () => {
  it('starts unchecked in light mode', () => {
    renderWithChakra(<DarkModeSwitch />)

    expect(screen.getByRole('checkbox', { name: 'Toggle dark mode' })).not.toBeChecked()
  })

  it('toggles the colour mode when clicked', async () => {
    const user = userEvent.setup()
    renderWithChakra(<DarkModeSwitch />)

    const toggle = screen.getByRole('checkbox', { name: 'Toggle dark mode' })
    await user.click(toggle)

    // The switch reflects colorMode from Chakra's context rather than local
    // state, so a checked box here means the provider actually flipped.
    expect(toggle).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('toggles back to light on a second click', async () => {
    const user = userEvent.setup()
    renderWithChakra(<DarkModeSwitch />)

    const toggle = screen.getByRole('checkbox', { name: 'Toggle dark mode' })
    await user.click(toggle)
    await user.click(toggle)

    expect(toggle).not.toBeChecked()
  })
})
