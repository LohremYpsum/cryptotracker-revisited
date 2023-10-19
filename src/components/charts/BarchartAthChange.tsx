import { useEffect, useRef } from 'react';
import { Card, CardBody, Text } from '@chakra-ui/react'
import Chart from 'chart.js/auto';

//utils
import { initialChartData } from '../../utils/chartData';
import { FetchCoins } from '../../hooks/useCoins'

interface Props {
    cryptos: FetchCoins[];
    chartTitle: string;
}

const BarchartAthChange = ({chartTitle, cryptos}: Props) => {
  
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const { currencySymbols, athChangeArray, colorArray } = initialChartData;

  useEffect(() => {
    const initializeChart = () => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: currencySymbols,
              datasets: [
                {
                  data: athChangeArray,
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
          //athChangeArray.push(coin.symbol);
          athChangeArray.push(coin.ath_change_percentage);
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

export default BarchartAthChange