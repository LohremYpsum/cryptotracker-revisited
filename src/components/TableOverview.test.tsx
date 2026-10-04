import { screen } from '@testing-library/react'
import { renderWithChakra } from '../test/renderWithChakra'
import { coin } from '../test/coinFixture'
import TableOverview from './TableOverview'

const pager = {
  page: 1,
  count: 10,
  isLoaded: false,
  onPageChange: () => {},
  onCountChange: () => {},
}

describe('TableOverview', () => {
  it('renders the error as readable text instead of crashing', () => {
    // Rendering an axios error object into JSX throws
    // "Objects are not valid as a React child" and takes the tree down with it.
    renderWithChakra(
      <TableOverview coinsData={[]} error="The market data could not be loaded (HTTP 500)." currency="eur" {...pager} />,
    )

    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument()
  })

  it('shows no error text when there is no error', () => {
    renderWithChakra(<TableOverview coinsData={[coin()]} error={null} currency="eur" {...pager} />)

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.queryByText(/could not be loaded/i)).not.toBeInTheDocument()
  })

  it('renders the coins it is given without fetching anything itself', () => {
    renderWithChakra(
      <TableOverview
        coinsData={[coin(), coin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' })]}
        error={null}
        currency="eur"
        {...pager}
      />,
    )

    expect(screen.getAllByRole('row')).toHaveLength(3)
  })
})
