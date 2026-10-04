import { Select } from '@chakra-ui/react'
import { currencySymbol, SUPPORTED_CURRENCIES } from '../../utils/currency'

interface CurrencySwitchProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const CurrencySwitch = ({ currency, onCurrencyChange }: CurrencySwitchProps) => {

  return (
    <Select
      size='sm'
      borderRadius={6}
      aria-label='Display currency'
      value={currency}
      onChange={(event) => onCurrencyChange(event.target.value)}
    >
      {SUPPORTED_CURRENCIES.map((code) => (
        <option key={code} value={code}>
          {currencySymbol(code)} {code.toUpperCase()}
        </option>
      ))}
    </Select>
  )
}

export default CurrencySwitch
