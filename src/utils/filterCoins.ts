import type { FetchCoins } from '../hooks/useCoins'

/**
 * Filter the loaded page by coin name or ticker symbol.
 *
 * This searches only what is currently loaded, which is a deliberate choice:
 * CoinGecko's free tier rate-limits at roughly 10-30 requests per minute, and
 * a request per keystroke against `/search` would exhaust that in seconds.
 * The trade-off is that a coin outside the current page cannot be found —
 * paging to it first is the workaround.
 */
export function filterCoins(coins: FetchCoins[], searchTerm: string): FetchCoins[] {
  const term = searchTerm.trim().toLowerCase()
  if (term === '') return coins

  return coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(term) || coin.symbol.toLowerCase().includes(term),
  )
}
