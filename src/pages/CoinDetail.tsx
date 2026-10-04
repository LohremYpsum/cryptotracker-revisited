import { Button, Container, Flex, Link, Spinner, Text } from '@chakra-ui/react'
import { Link as RouterLink, useParams } from 'react-router-dom';
import CoinSummary from '../components/CoinSummary';
import type { FetchCoins } from '../hooks/useCoins';

interface CoinDetailProps {
    coinsData: FetchCoins[];
    currency: string;
    error: string | null;
    isLoaded: boolean;
}

const CoinDetail = ({ coinsData, currency, error, isLoaded }: CoinDetailProps) => {

  const { id } = useParams();

  // The page renders from the list the overview already loaded; it never fetches
  // on its own, so a coin outside the loaded page cannot be resolved here.
  const coin = coinsData.find((entry) => entry.id === id);

  const body = () => {
    if (isLoaded) return <Spinner role='status' aria-label='Loading coin data' />
    if (error) return <Text>{error}</Text>
    if (!coin) {
      return (
        <Text>
          The coin &quot;{id}&quot; is not available on the page currently loaded. Go back and
          look for it in the table.
        </Text>
      )
    }
    return <CoinSummary coin={coin} currency={currency} />
  }

  return (
    <Container maxW={1200} paddingTop={6}>
      <Flex gap={3} paddingBottom={6} wrap='wrap'>
        <Button as={RouterLink} to='/' size='sm'>
          Back to overview
        </Button>
        <Button as={Link} href={`https://www.coingecko.com/en/coins/${id}`} isExternal size='sm' variant='outline'>
          View on CoinGecko
        </Button>
      </Flex>

      {body()}
    </Container>
  )
}

export default CoinDetail
