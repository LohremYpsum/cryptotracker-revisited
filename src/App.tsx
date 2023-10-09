import { Box, Container, Stack } from '@chakra-ui/react'
import NavBar from './components/NavBar'
import TableOverview from './components/TableOverview'
import PiechartMarketCap from './components/charts/PiechartMarketCap'
import BarchartCirculatingSupply from './components/charts/BarchartCirculatingSupply'
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
          <PiechartMarketCap cryptos={coinsData} chartTitle={''} />
        </Box>
        <Box w='600px' paddingTop={25}>
          <BarchartCirculatingSupply />
        </Box>
      </Stack>

      <Stack direction={['column', 'row']} spacing='24px'>
        <Box w='600px' h='40px' paddingTop={25}>
          <BarchartAthChange />
        </Box>
        <Box w='600px' h='40px' paddingTop={25}>
          <PiechartTradeVolume cryptos={coinsData} chartTitle={''}/>
        </Box>
      </Stack>

  
      </Container>
      
    </Box>
  )
}

export default App
