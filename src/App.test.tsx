import { screen, waitFor } from '@testing-library/react'
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
