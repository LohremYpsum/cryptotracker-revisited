import { useEffect, useRef } from 'react';
import { Card, CardBody, Text } from '@chakra-ui/react'
import Chart from 'chart.js/auto';

//utils
import { initialChartData } from '../../utils/chartData';
import { FetchCoins } from '../../hooks/useCoins';

interface Props {
  cryptos: FetchCoins[];
  chartTitle: string;
}

const PiechartMarketCap = ({ chartTitle, cryptos}: Props) => {
  
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const { currencySymbols, marketCap, colorArray } = initialChartData;

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
        throw new Error();
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