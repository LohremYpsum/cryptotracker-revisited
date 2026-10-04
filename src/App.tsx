import { Box, Container, Stack } from '@chakra-ui/react'
import NavBar from './components/commons/NavBar'
import TableOverview from './components/TableOverview'

import PiechartMarketCap from './components/charts/PiechartMarketCap'
import PiechartCirculatingSupply from './components/charts/PiechartCirculatingSupply'
import BarchartAthChange from './components/charts/BarchartAthChange'
import PiechartTradeVolume from './components/charts/PiechartTradeVolume'

import useCoins from './hooks/useCoins'


function App() {
  
  // Fetch Coins once for the whole page and pass them down.
  const {coinsData, error, currency} = useCoins();

  return (
    <Box>
      <NavBar />

      <Container maxW={1200}>
       <TableOverview coinsData={coinsData} error={error} currency={currency} />

      <Stack direction={['column', 'row']} spacing='24px' paddingBottom={50}>
        <Box w='600px' paddingTop={25} >
          <PiechartMarketCap cryptos={coinsData} chartTitle={'Market Capitalisation (absolute)'} />
        </Box>
        <Box w='600px' paddingTop={25}>
          <PiechartCirculatingSupply cryptos={coinsData} chartTitle={'Circulating Supply (absolute)'} />
        </Box>
      </Stack>

      <Stack direction={['column', 'row']} spacing='24px'>
        <Box w='600px' h='40px' paddingTop={25}>
          <BarchartAthChange cryptos={coinsData} chartTitle={'ATH Change in %'} />
        </Box>
        <Box w='600px' h='40px' paddingTop={25}>
          <PiechartTradeVolume cryptos={coinsData} chartTitle={'Current Trading Volume (absolute)'}/>
        </Box>
      </Stack>

  
      </Container>
      
    </Box>
  )
}

export default App
