import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { renderWithChakra } from './test/renderWithChakra'
import { coin } from './test/coinFixture'
import App from './App'

// jsdom has no 2D canvas context, so Chart.js cannot draw. Mock it away and let
// the chart components render their Card shell; the chart configuration itself
// is asserted in the chart component tests.
vi.mock('chart.js/auto', () => ({
  default: vi.fn(() => ({ destroy: vi.fn() })),
}))

describe('App', () => {
  it('requests the coin data once for the whole page', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())

    // App and TableOverview used to call useCoins() independently, which meant
    // two states and two requests for identical data against an API that rate
    // limits at ~10-30 requests per minute.
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('passes the fetch error down to the table', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('network down'))

    renderWithChakra(<App />)

    await waitFor(() => expect(screen.getByText('network down')).toBeInTheDocument())
  })

  it('hands the same coins to the table and the charts', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({
      data: [coin(), coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' })],
    })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Ethereum')).toBeInTheDocument())

    // One request, one state, four charts plus the table reading from it.
    expect(get).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
  })
})

describe('App user-facing copy', () => {
  it('labels every chart in English', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())

    // CLAUDE.md makes English mandatory for user-facing strings. These four
    // titles were the last German copy left in the app.
    expect(screen.getByText('Market Capitalisation (absolute)')).toBeInTheDocument()
    expect(screen.getByText('Circulating Supply (absolute)')).toBeInTheDocument()
    expect(screen.getByText('ATH Change in %')).toBeInTheDocument()
    expect(screen.getByText('Current Trading Volume (absolute)')).toBeInTheDocument()
  })

  it('spells the search placeholder correctly', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    renderWithChakra(<App />)

    expect(screen.getByPlaceholderText('Search coin')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Seach Coin')).not.toBeInTheDocument()
  })
})

describe('App currency switch', () => {
  it('refetches in the chosen currency and relabels the prices', async () => {
    const user = userEvent.setup()
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin({ current_price: 50000 })] })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())
    expect(get.mock.calls[0][0]).toContain('vs_currency=eur')
    expect(screen.getByText(/50000/)).toHaveTextContent('€')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Display currency' }), 'usd')

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get.mock.calls[1][0]).toContain('vs_currency=usd')
    await waitFor(() => expect(screen.getByText(/50000/)).toHaveTextContent('$'))
  })
})

describe('App pagination', () => {
  it('requests the next page when Next is clicked', async () => {
    const user = userEvent.setup()
    const full = Array.from({ length: 10 }, (_, i) => coin({ id: `c${i}`, name: `Coin ${i}` }))
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: full })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Coin 0')).toBeInTheDocument())
    expect(get.mock.calls[0][0]).toContain('&page=1')

    await user.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get.mock.calls[1][0]).toContain('&page=2')
    await waitFor(() => expect(screen.getByText('Page 2')).toBeInTheDocument())
  })

  it('requests a larger page when the size changes', async () => {
    const user = userEvent.setup()
    const full = Array.from({ length: 10 }, (_, i) => coin({ id: `c${i}`, name: `Coin ${i}` }))
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: full })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Coin 0')).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox', { name: 'Coins per page' }), '50')

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get.mock.calls[1][0]).toContain('per_page=50')
  })
})

describe('App search', () => {
  const page = [
    coin({ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' }),
    coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' }),
  ]

  it('narrows the table to matching coins as the user types', async () => {
    const user = userEvent.setup()
    vi.spyOn(axios, 'get').mockResolvedValue({ data: page })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox', { name: 'Search coin' }), 'eth')

    await waitFor(() => expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument())
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('fires no extra request while searching', async () => {
    const user = userEvent.setup()
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: page })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox', { name: 'Search coin' }), 'ethereum')

    // Filtering is client-side on purpose: a request per keystroke would burn
    // the ~10-30 requests per minute the free tier allows in seconds.
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('restores the full table when the search is cleared', async () => {
    const user = userEvent.setup()
    vi.spyOn(axios, 'get').mockResolvedValue({ data: page })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())

    const search = screen.getByRole('textbox', { name: 'Search coin' })
    await user.type(search, 'eth')
    await waitFor(() => expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument())

    await user.clear(search)

    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())
  })

  it('leaves the charts showing the whole page', async () => {
    const user = userEvent.setup()
    vi.spyOn(axios, 'get').mockResolvedValue({ data: page })

    renderWithChakra(<App />)
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox', { name: 'Search coin' }), 'eth')
    await waitFor(() => expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument())

    // The search narrows the table; the charts are an overview of the page.
    expect(screen.getByText('Market Capitalisation (absolute)')).toBeInTheDocument()
  })
})
