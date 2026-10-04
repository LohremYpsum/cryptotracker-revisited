import { renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import useCoins from './useCoins'
import type { FetchCoins } from './useCoins'

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

describe('useCoins', () => {
  it('requests the market data exactly once', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))

    // The effect calls setIsLoaded itself. With `isLoaded` in its own dependency
    // array every state change re-triggers the effect, which fires another request,
    // which flips `isLoaded` again — an unbounded request loop against an API that
    // rate-limits at ~10-30 requests per minute.
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('keeps the fetched coins in state', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin(), coin({ id: 'ethereum' })] })

    const { result } = renderHook(() => useCoins())

    await waitFor(() => expect(result.current.coinsData).toHaveLength(2))
    expect(result.current.coinsData[0].id).toBe('bitcoin')
  })

  it('does not fire a second request when the component re-renders', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result, rerender } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))

    rerender()
    rerender()

    expect(get).toHaveBeenCalledTimes(1)
  })
})
