/**
 * Shared colour palette for the charts.
 *
 * This module used to export a mutable `initialChartData` object that every
 * chart imported and pushed its values into. A module-level object is a
 * singleton: the four charts shared one `currencySymbols` array, and each
 * effect run appended to it instead of replacing it, so labels accumulated
 * duplicates on every fetch. Chart data is now derived from props in each
 * component; only the palette is genuinely shared and genuinely constant.
 */
export const colorArray: string[] = [
  '#f4a261',
  '#264653',
  '#2a9d8f',
  '#e9c46a',
  '#e76f51',
  '#d4e09b',
  '#f6f4d2',
  '#cbdfbd',
  '#f19c79',
  '#a44a3f',
  '#79addc',
  '#ffc09f',
  '#ffee93',
  '#fcf5c7',
  '#adf7b6',
];

/** Charts show at most this many coins; the palette has one colour per slice. */
export const MAX_CHART_ENTRIES = colorArray.length;
