import { useEffect, useMemo, useRef } from 'react';
import { Box, Card, CardBody, Text } from '@chakra-ui/react'
import Chart from 'chart.js/auto';

//utils
import { colorArray, MAX_CHART_ENTRIES } from '../../utils/chartData';
import type { FetchCoins } from '../../hooks/useCoins'

interface Props {
    cryptos: FetchCoins[];
    chartTitle: string;
}

const BarchartAthChange = ({chartTitle, cryptos}: Props) => {

  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const { labels, values } = useMemo(() => {
    const visible = cryptos.slice(0, MAX_CHART_ENTRIES);
    return {
      labels: visible.map((coin) => coin.symbol.toUpperCase()),
      values: visible.map((coin) => coin.ath_change_percentage),
    };
  }, [cryptos]);

  useEffect(() => {
    if (values.length === 0) return;

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colorArray,
            hoverBackgroundColor: colorArray,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
    });

    return () => chart.destroy();
  }, [labels, values]);


    return (
    <Card>
    <CardBody>
    <Text>{chartTitle}</Text>
      <Box h={['220px', '260px', '300px']}>
        <canvas ref={chartRef}></canvas>
      </Box>
    </CardBody>
  </Card>
  )
}

export default BarchartAthChange
