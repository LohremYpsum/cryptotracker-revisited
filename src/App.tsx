import { Box, Text, Center, Flex, Square, Container, Card, CardBody, Stack } from '@chakra-ui/react'
import NavBar from './components/NavBar'
import PiechartMarketCap from './components/charts/PiechartMarketCap'
import TableOverview from './components/TableOverview'
import BarchartCirculatingSupply from './components/charts/BarchartCirculatingSupply'
import BarchartAthChange from './components/charts/BarchartAthChange'
import PiechartTradeVolume from './components/charts/PiechartTradeVolume'

function App() {
  return (
    <Box>
      <NavBar />

      <Container maxW={1200}>
        
      <Stack direction={['column', 'row']} spacing='24px' paddingBottom={50}>
        <Box w='600px' h='40px' paddingTop={25} >
          <PiechartMarketCap />
        </Box>
        <Box w='600px' h='40px' paddingTop={25}>
          <BarchartCirculatingSupply />
        </Box>
      </Stack>

      <Stack direction={['column', 'row']} spacing='24px'>
        <Box w='600px' h='40px' paddingTop={25}>
          <BarchartAthChange />
        </Box>
        <Box w='600px' h='40px' paddingTop={25}>
          <PiechartTradeVolume />
        </Box>
      </Stack>

  
      </Container>
      
    </Box>
  )
}

export default App
