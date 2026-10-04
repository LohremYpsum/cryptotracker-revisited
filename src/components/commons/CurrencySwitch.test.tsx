import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithChakra } from '../../test/renderWithChakra'
import CurrencySwitch from './CurrencySwitch'

describe('CurrencySwitch', () => {
  it('shows the active currency as the selected option', () => {
    renderWithChakra(<CurrencySwitch currency="usd" onCurrencyChange={() => {}} />)

    expect(screen.getByRole('combobox', { name: 'Display currency' })).toHaveValue('usd')
  })

  it('offers every supported currency with its symbol', () => {
    renderWithChakra(<CurrencySwitch currency="eur" onCurrencyChange={() => {}} />)

    expect(screen.getByRole('option', { name: '€ EUR' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '$ USD' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '£ GBP' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '¥ JPY' })).toBeInTheDocument()
  })

  it('reports the selected code, not the symbol', async () => {
    const onCurrencyChange = vi.fn()
    const user = userEvent.setup()
    renderWithChakra(<CurrencySwitch currency="eur" onCurrencyChange={onCurrencyChange} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Display currency' }), 'usd')

    // The API wants the lower-case code in vs_currency; handing it the symbol
    // would produce a request for a currency that does not exist.
    expect(onCurrencyChange).toHaveBeenCalledWith('usd')
  })
})
