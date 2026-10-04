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

  it('AK-E05-1.1 — links the details button to the in-app route of its own coin', () => {
    renderWithChakra(
      <MainTable
        coinsData={[coin(), coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' })]}
        currency="eur"
      />,
    )

    const [bitcoin, ethereum] = screen.getAllByRole('link', { name: 'Details' })
    expect(bitcoin).toHaveAttribute('href', '/coin/bitcoin')
    expect(ethereum).toHaveAttribute('href', '/coin/ethereum')
  })

  it('AK-E05-1.2 — keeps the details button inside the app instead of opening CoinGecko', () => {
    renderWithChakra(<MainTable coinsData={[coin({ id: 'bitcoin' })]} currency="eur" />)

    // The button used to be the CoinGecko link itself, which threw the user out
    // of the app. The external reference now lives on the detail page.
    const detailsLink = screen.getByRole('link', { name: 'Details' })
    expect(detailsLink).not.toHaveAttribute('target')
    expect(detailsLink.getAttribute('href')).not.toContain('coingecko.com')
  })

  it('AK-E05-1.5 — renders the details link as its own anchor, not nested in a button', () => {
    renderWithChakra(<MainTable coinsData={[coin({ id: 'bitcoin' })]} currency="eur" />)

    // A nested anchor inside a <button> swallows the click — the link must stand on its own.
    expect(screen.getByRole('link', { name: 'Details' }).closest('button')).toBeNull()
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
