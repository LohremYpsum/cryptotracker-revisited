import { Card, CardBody, Text } from '@chakra-ui/react'
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

interface Crypto {
  symbol: string;
  market_cap: number;
}
interface Props {
  cryptos: Crypto[];
  chartTitle: string;
}

const PiechartMarketCap = ({ chartTitle, cryptos}: Props) => {

  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const currencySymbols: any[] = [];
  const marketCap: any[] = [];
  const colorArray = [
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

  useEffect(() => {
    const initializeChart = () => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: currencySymbols,
              datasets: [
                {
                  data: marketCap,
                  backgroundColor: colorArray,
                  hoverBackgroundColor: colorArray,
                },
              ],
            },
            options: {
              // Add any additional chart options here
            },
          });
        }
      }
    };

    try {
      if (Array.isArray(cryptos) && cryptos.length > 0) {
        cryptos.forEach((coin, index) => {
          currencySymbols.push(coin.symbol);
          marketCap.push(coin.market_cap);
          if (index === 14) throw new Error();
        });

        initializeChart();
      } else {
        throw new Error('Invalid or empty cryptos array.');
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }, [cryptos]);

  return (
    <Card>
    <CardBody>
      <Text>{chartTitle}</Text>
      <canvas ref={chartRef} width={50} height={50}></canvas>
    </CardBody>
  </Card>
  )
}

export default PiechartMarketCap