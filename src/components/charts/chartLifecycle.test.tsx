import { renderWithChakra } from '../../test/renderWithChakra'
import { coin } from '../../test/coinFixture'
import PiechartMarketCap from './PiechartMarketCap'
import PiechartCirculatingSupply from './PiechartCirculatingSupply'
import PiechartTradeVolume from './PiechartTradeVolume'
import BarchartAthChange from './BarchartAthChange'

// vi.mock is hoisted above the imports, so the spy has to be hoisted with it.
const { destroy, chartConstructor } = vi.hoisted(() => ({
  destroy: vi.fn(),
  chartConstructor: vi.fn(),
}))

vi.mock('chart.js/auto', () => ({
  default: class {
    destroy = destroy
    constructor(...args: unknown[]) {
      chartConstructor(...args)
    }
  },
}))

// jsdom returns null from getContext('2d'), and the components skip chart
// creation entirely when the context is missing. Stub it so the code under
// test actually reaches `new Chart(...)`.
beforeEach(() => {
  destroy.mockClear()
  chartConstructor.mockClear()
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as unknown as typeof HTMLCanvasElement.prototype.getContext
})

const charts = [
  ['PiechartMarketCap', PiechartMarketCap],
  ['PiechartCirculatingSupply', PiechartCirculatingSupply],
  ['PiechartTradeVolume', PiechartTradeVolume],
  ['BarchartAthChange', BarchartAthChange],
] as const

describe.each(charts)('%s', (_name, ChartComponent) => {
  it('creates a chart instance when it has data', () => {
    renderWithChakra(<ChartComponent cryptos={[coin()]} chartTitle="Title" />)

    expect(chartConstructor).toHaveBeenCalledTimes(1)
  })

  it('destroys its chart instance on unmount', () => {
    const { unmount } = renderWithChakra(
      <ChartComponent cryptos={[coin()]} chartTitle="Title" />,
    )

    expect(destroy).not.toHaveBeenCalled()
    unmount()

    // Without this, Chart.js keeps the canvas registered and the next mount
    // throws "Canvas is already in use".
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('releases the canvas before rebuilding on new data', () => {
    const { rerender } = renderWithChakra(
      <ChartComponent cryptos={[coin()]} chartTitle="Title" />,
    )

    rerender(<ChartComponent cryptos={[coin({ id: 'ethereum' })]} chartTitle="Title" />)

    expect(destroy).toHaveBeenCalledTimes(1)
    expect(chartConstructor).toHaveBeenCalledTimes(2)
  })
})
