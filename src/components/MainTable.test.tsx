import { screen, within } from '@testing-library/react'
import { renderWithChakra } from '../test/renderWithChakra'
import MainTable from './MainTable'
import type { FetchCoins } from '../hooks/useCoins'

function coin(overrides: Partial<FetchCoins> = {}): FetchCoins {
  return {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    current_price: 50000,
    ath: 60000,
    ath_change_percentage: -16.6,
    image: 'https://example.test/btc.png',
    market_cap: 1_000_000,
    circulating_supply: 19_000_000,
    total_volume: 500_000,
    ...overrides,
  }
}

describe('MainTable', () => {
  it('renders one row per coin', () => {
    renderWithChakra(
      <MainTable
        coinsData={[coin(), coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' })]}
        currency="eur"
      />,
    )

    // One row per coin, plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('uppercases the ticker symbol', () => {
    renderWithChakra(<MainTable coinsData={[coin({ symbol: 'btc' })]} currency="eur" />)

    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.queryByText('btc')).not.toBeInTheDocument()
  })

  it('renders an empty body without crashing when there are no coins', () => {
    renderWithChakra(<MainTable coinsData={[]} currency="eur" />)

    const [headerRow] = screen.getAllByRole('row')
    expect(within(headerRow).getByText('Currency Name')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('links the details button to the coin page on CoinGecko', () => {
    renderWithChakra(<MainTable coinsData={[coin({ id: 'bitcoin' })]} currency="eur" />)

    const detailsLink = screen.getByRole('link', { name: 'Details' })
    expect(detailsLink).toHaveAttribute('href', 'https://www.coingecko.com/en/coins/bitcoin')
    expect(detailsLink).toHaveAttribute('target', '_blank')
    expect(detailsLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
    // A nested anchor inside a <button> swallows the click — the link must stand on its own.
    expect(detailsLink.closest('button')).toBeNull()
  })
})

describe('MainTable currency', () => {
  it('renders the euro sign for eur', () => {
    renderWithChakra(<MainTable coinsData={[coin({ current_price: 50000 })]} currency="eur" />)

    expect(screen.getByText(/50000/)).toHaveTextContent('€')
  })

  it('renders the dollar sign for usd', () => {
    renderWithChakra(<MainTable coinsData={[coin({ current_price: 50000 })]} currency="usd" />)

    // `currency ? '€' : '$'` is always truthy for a non-empty string, so the
    // dollar branch was unreachable and usd rendered as euro.
    const priceCell = screen.getByText(/50000/)
    expect(priceCell).toHaveTextContent('$')
    expect(priceCell).not.toHaveTextContent('€')
  })

  it('falls back to the upper-case code for a currency with no symbol', () => {
    renderWithChakra(<MainTable coinsData={[coin({ current_price: 50000 })]} currency="chf" />)

    expect(screen.getByText(/50000/)).toHaveTextContent('CHF')
  })
})
