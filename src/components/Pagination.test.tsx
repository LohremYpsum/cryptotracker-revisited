import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithChakra } from '../test/renderWithChakra'
import Pagination from './Pagination'

function setup(overrides: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  const props = {
    page: 2,
    count: 10,
    loadedRows: 10,
    isLoaded: false,
    onPageChange: vi.fn(),
    onCountChange: vi.fn(),
    ...overrides,
  }
  renderWithChakra(<Pagination {...props} />)
  return props
}

describe('Pagination', () => {
  it('shows the current page', () => {
    setup({ page: 3 })

    expect(screen.getByText('Page 3')).toBeInTheDocument()
  })

  it('steps forward and backward by one', async () => {
    const user = userEvent.setup()
    const props = setup({ page: 2 })

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(props.onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(props.onPageChange).toHaveBeenCalledWith(1)
  })

  it('cannot go back past the first page', () => {
    setup({ page: 1 })

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('cannot go forward from a short page', () => {
    // CoinGecko reports no total count, so a page that came back with fewer
    // rows than requested is the only signal that the list has ended.
    setup({ page: 4, count: 10, loadedRows: 3 })

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('blocks both buttons while a request is in flight', () => {
    setup({ page: 2, isLoaded: true })

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('reports the page size as a number', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Coins per page' }), '25')

    // A select hands back a string; the hook puts this straight into per_page.
    expect(props.onCountChange).toHaveBeenCalledWith(25)
  })
})
