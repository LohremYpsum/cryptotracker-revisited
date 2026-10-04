import type { ChartConfiguration } from 'chart.js'
import { renderWithChakra } from '../../test/renderWithChakra'
import { coin } from '../../test/coinFixture'
import { MAX_CHART_ENTRIES } from '../../utils/chartData'
import PiechartMarketCap from './PiechartMarketCap'
import PiechartCirculatingSupply from './PiechartCirculatingSupply'
import PiechartTradeVolume from './PiechartTradeVolume'
import BarchartAthChange from './BarchartAthChange'

const { chartConstructor } = vi.hoisted(() => ({ chartConstructor: vi.fn() }))

vi.mock('chart.js/auto', () => ({
  default: class {
    destroy = vi.fn()
    constructor(...args: unknown[]) {
      chartConstructor(...args)
    }
  },
}))

beforeEach(() => {
  chartConstructor.mockClear()
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => ({}),
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext
})

/** The configuration handed to Chart.js on the most recent construction. */
function lastConfig(): ChartConfiguration {
  const calls = chartConstructor.mock.calls
  return calls[calls.length - 1][1] as ChartConfiguration
}

function labelsOf(config: ChartConfiguration): string[] {
  return (config.data.labels ?? []) as string[]
}

function valuesOf(config: ChartConfiguration): number[] {
  return config.data.datasets[0].data as number[]
}

const coins = [
  coin({ id: 'bitcoin', symbol: 'btc', market_cap: 100, circulating_supply: 10, total_volume: 1, ath_change_percentage: -5 }),
  coin({ id: 'ethereum', symbol: 'eth', market_cap: 200, circulating_supply: 20, total_volume: 2, ath_change_percentage: -15 }),
]

describe('chart data derived from props', () => {
  it('gives PiechartMarketCap the market cap values', () => {
    renderWithChakra(<PiechartMarketCap cryptos={coins} chartTitle="Market cap" />)

    expect(labelsOf(lastConfig())).toEqual(['BTC', 'ETH'])
    expect(valuesOf(lastConfig())).toEqual([100, 200])
  })

  it('gives PiechartCirculatingSupply the circulating supply values', () => {
    renderWithChakra(<PiechartCirculatingSupply cryptos={coins} chartTitle="Supply" />)

    expect(valuesOf(lastConfig())).toEqual([10, 20])
  })

  it('gives PiechartTradeVolume the trade volume values', () => {
    renderWithChakra(<PiechartTradeVolume cryptos={coins} chartTitle="Volume" />)

    expect(valuesOf(lastConfig())).toEqual([1, 2])
  })

  it('gives BarchartAthChange the ATH change values and real labels', () => {
    renderWithChakra(<BarchartAthChange cryptos={coins} chartTitle="ATH" />)

    // The bar chart never pushed any labels at all, so it rendered against
    // whichever symbols the three doughnut charts happened to have left behind.
    expect(labelsOf(lastConfig())).toEqual(['BTC', 'ETH'])
    expect(valuesOf(lastConfig())).toEqual([-5, -15])
  })

  it('does not accumulate entries across re-renders', () => {
    const { rerender } = renderWithChakra(
      <PiechartMarketCap cryptos={coins} chartTitle="Market cap" />,
    )

    rerender(<PiechartMarketCap cryptos={[...coins]} chartTitle="Market cap" />)
    rerender(<PiechartMarketCap cryptos={[...coins]} chartTitle="Market cap" />)

    // The shared mutable singleton was pushed into on every effect run, so the
    // third render used to show six slices for two coins.
    expect(labelsOf(lastConfig())).toEqual(['BTC', 'ETH'])
    expect(valuesOf(lastConfig())).toHaveLength(2)
  })

  it('does not leak data between two different charts', () => {
    renderWithChakra(<PiechartMarketCap cryptos={coins} chartTitle="Market cap" />)
    const marketCapLabels = labelsOf(lastConfig())

    renderWithChakra(<PiechartTradeVolume cryptos={[coin({ symbol: 'sol' })]} chartTitle="Volume" />)

    expect(marketCapLabels).toEqual(['BTC', 'ETH'])
    expect(labelsOf(lastConfig())).toEqual(['SOL'])
  })

  it('caps the chart at one slice per palette colour', () => {
    const many = Array.from({ length: MAX_CHART_ENTRIES + 7 }, (_, i) =>
      coin({ id: `coin-${i}`, symbol: `c${i}`, market_cap: i }),
    )

    renderWithChakra(<PiechartMarketCap cryptos={many} chartTitle="Market cap" />)

    // The cap used to be a thrown Error used as a loop break.
    expect(valuesOf(lastConfig())).toHaveLength(MAX_CHART_ENTRIES)
  })

  it('builds no chart at all when there are no coins', () => {
    renderWithChakra(<PiechartMarketCap cryptos={[]} chartTitle="Market cap" />)

    expect(chartConstructor).not.toHaveBeenCalled()
  })
})
