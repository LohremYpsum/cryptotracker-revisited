export type ChartData = {
    marketCap: number[];
    circSupArray: number[];
    athChangeArray: number[];
    tradeVolArray: number[];
    currencySymbols: string[];
    colorArray: string[];
  };

  export const initialChartData: ChartData = {
    marketCap: [],
    circSupArray: [],
    tradeVolArray: [],
    athChangeArray: [],
    currencySymbols: [],
    colorArray: [
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
    ],
  };
