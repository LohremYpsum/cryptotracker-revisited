import { Box, Button, ButtonGroup, Text, Center, Flex, Square, HStack, Container, Spacer } from '@chakra-ui/react'
import NavBar from './components/NavBar'

function App() {
  return (
    <Box>
      <NavBar />
    
      <Flex color='white'>
      
        <Center w='100px' bg='green.500'>
          <Text>Box 1</Text>
        </Center>
        <Square bg='blue.500' size='150px'>
          <Text>Box 2</Text>
        </Square>
        <Box flex='1' bg='tomato'>
          <Text>Box 3</Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default App
