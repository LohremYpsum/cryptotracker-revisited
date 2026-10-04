import { screen } from '@testing-library/react'
import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { renderWithChakra } from '../test/renderWithChakra'
import { coin } from '../test/coinFixture'
import type { FetchCoins } from '../hooks/useCoins'
import CoinDetail from './CoinDetail'

interface Options {
  coinsData?: FetchCoins[]
  error?: string | null
  isLoaded?: boolean
  url?: string
}

/**
 * Render the route with a matching `Route`, which is what `useParams` needs to
 * see an `:id` at all. Everything the page reads arrives as props, exactly as
 * `App` hands it over.
 */
function renderDetail({
  coinsData = [coin()],
  error = null,
  isLoaded = false,
  url = '/coin/bitcoin',
}: Options = {}) {
  return renderWithChakra(
    <Routes>
      <Route
        path="/coin/:id"
        element={
          <CoinDetail coinsData={coinsData} currency="eur" error={error} isLoaded={isLoaded} />
        }
      />
    </Routes>,
    { initialEntries: [url] },
  )
}

describe('CoinDetail', () => {
  it('AK-E05-2.7 — renders the coin named in the URL, not the first one loaded', () => {
    renderDetail({
      coinsData: [
        // 88888 appears in no other field of either fixture, so its absence is
        // evidence and not an accident of overlapping digits.
        coin({ id: 'bitcoin', name: 'Bitcoin', current_price: 88888 }),
        coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3123 }),
      ],
      url: '/coin/ethereum',
    })

    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getByText(/3123/)).toBeInTheDocument()
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
    expect(screen.queryByText(/88888/)).not.toBeInTheDocument()
  })

  it('AK-E05-3.1 — offers a back link to the overview', () => {
    renderDetail()

    expect(screen.getByRole('link', { name: 'Back to overview' })).toHaveAttribute('href', '/')
  })
})

describe('CoinDetail states', () => {
  it('AK-E05-4.1 — shows a loading indicator while the coin list is in flight', () => {
    renderDetail({ coinsData: [], isLoaded: true, url: '/coin/bitcoin' })

    expect(screen.getByRole('status')).toBeInTheDocument()
    // An empty list during loading is not the same as a missing coin.
    expect(screen.queryByText(/not available/i)).not.toBeInTheDocument()
  })

  it('AK-E05-4.2 — names the requested id when the coin is not in the loaded data', () => {
    renderDetail({ coinsData: [coin({ id: 'bitcoin' })], url: '/coin/some-small-token' })

    expect(screen.getByText(/some-small-token/)).toBeInTheDocument()
  })

  it('AK-E05-4.3 — offers the back link from the not-available message too', () => {
    renderDetail({ coinsData: [coin({ id: 'bitcoin' })], url: '/coin/some-small-token' })

    expect(screen.getByRole('link', { name: 'Back to overview' })).toHaveAttribute('href', '/')
  })

  it('AK-E05-4.4 — renders the fetch error instead of claiming the coin is missing', () => {
    renderDetail({
      coinsData: [],
      error: 'Too many requests to the CoinGecko API. Please wait a moment.',
      url: '/coin/bitcoin',
    })

    expect(
      screen.getByText('Too many requests to the CoinGecko API. Please wait a moment.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/not available/i)).not.toBeInTheDocument()
  })

  it('AK-E05-4.5 — fetches nothing of its own in any state', () => {
    const get = vi.spyOn(axios, 'get')

    renderDetail()
    renderDetail({ coinsData: [], isLoaded: true })
    renderDetail({ coinsData: [coin()], url: '/coin/some-small-token' })

    // The page renders from the list App already loaded — CoinGecko rate limits
    // at roughly 10-30 requests per minute.
    expect(get).not.toHaveBeenCalled()
  })
})

describe('CoinDetail external reference', () => {
  it('AK-E05-6.1 — links to the coin on CoinGecko', () => {
    renderDetail({ coinsData: [coin({ id: 'bitcoin' })], url: '/coin/bitcoin' })

    expect(screen.getByRole('link', { name: 'View on CoinGecko' })).toHaveAttribute(
      'href',
      'https://www.coingecko.com/en/coins/bitcoin',
    )
  })

  it('AK-E05-6.2 — opens the external link in a new tab without handing over the opener', () => {
    renderDetail()

    const external = screen.getByRole('link', { name: 'View on CoinGecko' })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('AK-E05-6.3 — puts the in-app path before the external one', () => {
    renderDetail()

    const links = screen.getAllByRole('link')
    const back = links.indexOf(screen.getByRole('link', { name: 'Back to overview' }))
    const external = links.indexOf(screen.getByRole('link', { name: 'View on CoinGecko' }))

    // Keyboard navigation should reach the way back into the app first.
    expect(back).toBeLessThan(external)
  })
})
