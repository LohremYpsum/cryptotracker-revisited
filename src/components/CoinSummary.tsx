import { Box, Flex, Heading, Image, SimpleGrid, Stat, StatLabel, StatNumber, Tag } from '@chakra-ui/react'
import type { FetchCoins } from '../hooks/useCoins';
import { currencySymbol } from '../utils/currency';

interface CoinSummaryProps {
    coin: FetchCoins;
    currency: string;
}

const CoinSummary = ({ coin, currency }: CoinSummaryProps) => {

  const symbol = currencySymbol(currency);

  // Labels and values side by side; the currency symbol comes from the shared
  // helper so the detail view can never disagree with the table.
  const figures = [
    { label: 'Current Price', value: `${coin.current_price} ${symbol}` },
    { label: 'All-Time High', value: `${coin.ath} ${symbol}` },
    { label: 'ATH Change', value: `${coin.ath_change_percentage} %` },
    { label: 'Market Capitalisation', value: `${coin.market_cap} ${symbol}` },
    { label: 'Circulating Supply', value: `${coin.circulating_supply}` },
    { label: 'Trading Volume', value: `${coin.total_volume} ${symbol}` },
  ];

  return (
    <Box>
      <Flex alignItems='center' gap={4} paddingBottom={6}>
        <Image boxSize='64px' borderRadius={12} src={coin.image} alt={coin.name} />
        <Heading size='lg'>{coin.name}</Heading>
        <Tag size='lg' colorScheme='teal'>{coin.symbol.toUpperCase()}</Tag>
      </Flex>

      <SimpleGrid columns={[1, 2, 3]} spacing='24px'>
        {figures.map((figure) => (
          <Stat key={figure.label}>
            <StatLabel>{figure.label}</StatLabel>
            <StatNumber fontSize='xl'>{figure.value}</StatNumber>
          </Stat>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default CoinSummary
