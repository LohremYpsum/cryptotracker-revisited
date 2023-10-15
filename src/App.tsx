import { Box, Container, Stack } from '@chakra-ui/react'
import NavBar from './components/commons/NavBar'
import TableOverview from './components/TableOverview'

import PiechartMarketCap from './components/charts/PiechartMarketCap'
import PiechartCirculatingSupply from './components/charts/PiechartCirculatingSupply'
import BarchartAthChange from './components/charts/BarchartAthChange'
import PiechartTradeVolume from './components/charts/PiechartTradeVolume'

import useCoins from './hooks/useCoins'


function App() {
  
  // Fetch Coins 
  const {coinsData, error, isLoaded, currency} = useCoins();

  return (
    <Box>
      <NavBar />

      <Container maxW={1200}>
       <TableOverview /> 

      <Stack direction={['column', 'row']} spacing='24px' paddingBottom={50}>
        <Box w='600px' paddingTop={25} >
          <PiechartMarketCap cryptos={coinsData} chartTitle={'Marktkapitalisierung (Abs. Zahlen)'} />
        </Box>
        <Box w='600px' paddingTop={25}>
          <PiechartCirculatingSupply cryptos={coinsData} chartTitle={'Umlaufmenge (Abs. Zahlen)'} />
        </Box>
      </Stack>

      <Stack direction={['column', 'row']} spacing='24px'>
        <Box w='600px' h='40px' paddingTop={25}>
          <BarchartAthChange cryptos={coinsData} chartTitle={'ATH Veränderung in %'} />
        </Box>
        <Box w='600px' h='40px' paddingTop={25}>
          <PiechartTradeVolume cryptos={coinsData} chartTitle={'Aktuelles Handelsvolumen (Abs. Zahlen)'}/>
        </Box>
      </Stack>

  
      </Container>
      
    </Box>
  )
}

export default App
