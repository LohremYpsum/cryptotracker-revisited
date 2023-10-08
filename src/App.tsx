import { Box, Text, Center, Flex, Square, Container } from '@chakra-ui/react'
import NavBar from './components/NavBar'
import TableOverview from './components/TableOverview'

function App() {
  return (
    <Box>
      <NavBar />

      <Container maxW={1600}>
        <TableOverview />
      </Container>
      
    </Box>
  )
}

export default App
