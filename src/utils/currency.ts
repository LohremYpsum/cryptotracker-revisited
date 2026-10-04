/**
 * Display symbol for a CoinGecko `vs_currency` code.
 *
 * The code is the lower-case string the API expects (`eur`, `usd`). It used to
 * be evaluated as a boolean — `currency ? '€' : '$'` — which is always truthy
 * for a non-empty string, so the dollar branch was unreachable and every price
 * rendered with a euro sign regardless of the currency actually requested.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  eur: '€',
  usd: '$',
  gbp: '£',
  jpy: '¥',
}

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toLowerCase()] ?? currency.toUpperCase()
}

/** The currencies offered in the switch, in display order. */
export const SUPPORTED_CURRENCIES = ['eur', 'usd', 'gbp', 'jpy'] as const
