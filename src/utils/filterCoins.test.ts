import { filterCoins } from './filterCoins'
import { coin } from '../test/coinFixture'

const coins = [
  coin({ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' }),
  coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' }),
  coin({ id: 'tether', name: 'Tether', symbol: 'usdt' }),
]

describe('filterCoins', () => {
  it('returns everything for an empty term', () => {
    expect(filterCoins(coins, '')).toHaveLength(3)
  })

  it('returns everything for a term of only whitespace', () => {
    expect(filterCoins(coins, '   ')).toHaveLength(3)
  })

  it('matches on the coin name', () => {
    expect(filterCoins(coins, 'ether').map((c) => c.id)).toEqual(['ethereum', 'tether'])
  })

  it('matches on the ticker symbol', () => {
    expect(filterCoins(coins, 'btc').map((c) => c.id)).toEqual(['bitcoin'])
  })

  it('ignores case on both sides', () => {
    expect(filterCoins(coins, 'BiTcOiN').map((c) => c.id)).toEqual(['bitcoin'])
    expect(filterCoins(coins, 'USDT').map((c) => c.id)).toEqual(['tether'])
  })

  it('ignores surrounding whitespace', () => {
    // "eth" is a substring of Tether as well as Ethereum, so the point here is
    // that padding changes nothing — not that the match narrows to one coin.
    expect(filterCoins(coins, '  eth  ')).toEqual(filterCoins(coins, 'eth'))
    expect(filterCoins(coins, '  eth  ').map((c) => c.id)).toEqual(['ethereum', 'tether'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterCoins(coins, 'dogecoin')).toEqual([])
  })

  it('does not mutate the input', () => {
    const original = [...coins]
    filterCoins(coins, 'btc')
    expect(coins).toEqual(original)
  })
})
