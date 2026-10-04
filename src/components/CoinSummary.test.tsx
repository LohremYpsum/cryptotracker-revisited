import { screen } from '@testing-library/react'
import { renderWithChakra } from '../test/renderWithChakra'
import { coin } from '../test/coinFixture'
import CoinSummary from './CoinSummary'

describe('CoinSummary', () => {
  it('AK-E05-2.1 — renders the coin name and its upper-cased ticker symbol', () => {
    renderWithChakra(<CoinSummary coin={coin({ name: 'Bitcoin', symbol: 'btc' })} currency="eur" />)

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.queryByText('btc')).not.toBeInTheDocument()
  })

  it('AK-E05-2.2 — renders the coin image with the coin name as its accessible name', () => {
    renderWithChakra(
      <CoinSummary
        coin={coin({ name: 'Bitcoin', image: 'https://example.test/btc.png' })}
        currency="eur"
      />,
    )

    const logo = screen.getByRole('img', { name: 'Bitcoin' })
    expect(logo).toHaveAttribute('src', 'https://example.test/btc.png')
  })

  it('AK-E05-2.3 — labels every figure in English', () => {
    renderWithChakra(<CoinSummary coin={coin()} currency="eur" />)

    expect(screen.getByText('Current Price')).toBeInTheDocument()
    expect(screen.getByText('All-Time High')).toBeInTheDocument()
    expect(screen.getByText('ATH Change')).toBeInTheDocument()
    expect(screen.getByText('Market Capitalisation')).toBeInTheDocument()
    expect(screen.getByText('Circulating Supply')).toBeInTheDocument()
    expect(screen.getByText('Trading Volume')).toBeInTheDocument()
  })
})

describe('CoinSummary currency', () => {
  // The figures a user can read off the page have to follow the currency switch.
  // `currencySymbol` is the single source for that mapping — the detail view must
  // not grow a second one.
  // Deliberately non-overlapping digits: `getByText(/50000/)` would also match
  // "500000" and fail with "found multiple elements".
  const monetary = coin({
    current_price: 50000,
    ath: 61234,
    market_cap: 7_000_111,
    total_volume: 432_100,
  })

  it('AK-E05-2.4 — renders the euro sign for eur', () => {
    renderWithChakra(<CoinSummary coin={monetary} currency="eur" />)

    expect(screen.getByText(/50000/)).toHaveTextContent('€')
    expect(screen.getByText(/61234/)).toHaveTextContent('€')
    expect(screen.getByText(/7000111/)).toHaveTextContent('€')
    expect(screen.getByText(/432100/)).toHaveTextContent('€')
  })

  it('AK-E05-2.4 — renders the dollar sign for usd and no euro sign anywhere', () => {
    renderWithChakra(<CoinSummary coin={monetary} currency="usd" />)

    expect(screen.getByText(/50000/)).toHaveTextContent('$')
    expect(screen.getByText(/61234/)).toHaveTextContent('$')
    expect(screen.getByText(/7000111/)).toHaveTextContent('$')
    expect(screen.getByText(/432100/)).toHaveTextContent('$')
    expect(screen.queryByText(/€/)).not.toBeInTheDocument()
  })

  it('AK-E05-2.4 — falls back to the upper-case code for a currency with no symbol', () => {
    renderWithChakra(<CoinSummary coin={monetary} currency="chf" />)

    expect(screen.getByText(/50000/)).toHaveTextContent('CHF')
  })

  it('AK-E05-2.5 — renders the circulating supply without a currency symbol', () => {
    renderWithChakra(
      <CoinSummary coin={coin({ circulating_supply: 19_000_000 })} currency="eur" />,
    )

    // A coin count is not an amount of money.
    const supply = screen.getByText(/19000000/)
    expect(supply).not.toHaveTextContent('€')
    expect(supply).not.toHaveTextContent('$')
  })

  it('AK-E05-2.6 — renders the ATH change with a percent sign', () => {
    renderWithChakra(<CoinSummary coin={coin({ ath_change_percentage: -16.6 })} currency="eur" />)

    expect(screen.getByText(/-16.6/)).toHaveTextContent('%')
  })
})
