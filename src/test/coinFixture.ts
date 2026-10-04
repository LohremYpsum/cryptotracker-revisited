import type { FetchCoins } from '../hooks/useCoins'

/**
 * Build a `FetchCoins` entry for tests.
 *
 * The CoinGecko payload has ten fields and every component reads a different
 * subset of them, so tests that build the object inline end up repeating all
 * ten to exercise one. Override only what the test is actually about.
 */
export function coin(overrides: Partial<FetchCoins> = {}): FetchCoins {
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
