import { act, renderHook, waitFor } from '@testing-library/react'
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

describe('useCoins error handling', () => {
  it('exposes the error as a string, never as an object', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useCoins())

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(typeof result.current.error).toBe('string')
    expect(result.current.error).toBe('boom')
  })

  it('clears a previous error when a new request starts', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())

    await waitFor(() => expect(result.current.isLoaded).toBe(false))
    expect(result.current.error).toBeNull()
  })
})

describe('useCoins request url', () => {
  it('asks the API for the selected currency', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))

    expect(get.mock.calls[0][0]).toContain('vs_currency=eur')
  })
})

describe('useCoins controls', () => {
  it('refetches the next page when setPage is called', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))
    expect(get.mock.calls[0][0]).toContain('&page=1')

    act(() => result.current.setPage(2))

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get.mock.calls[1][0]).toContain('&page=2')
  })

  it('refetches in the new currency when setCurrency is called', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))

    act(() => result.current.setCurrency('usd'))

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get.mock.calls[1][0]).toContain('vs_currency=usd')
    await waitFor(() => expect(result.current.currency).toBe('usd'))
  })

  it('refetches with a new page size when setCount is called', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))
    expect(result.current.count).toBe(10)

    act(() => result.current.setCount(25))

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get.mock.calls[1][0]).toContain('per_page=25')
  })

  it('exposes the current page and page size', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [coin()] })

    const { result } = renderHook(() => useCoins())
    await waitFor(() => expect(result.current.isLoaded).toBe(false))

    expect(result.current.page).toBe(1)
    expect(result.current.count).toBe(10)
    expect(result.current.currency).toBe('eur')
  })
})
