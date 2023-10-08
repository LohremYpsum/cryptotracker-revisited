import {Box, Flex, Spacer, Text } from '@chakra-ui/react'
import DarkModeSwitch from './DarkModeSwitch'
import SearchBar from './SearchBar'

const NavBar = () => {
  return (
    <Flex>
    <Text h={10}>Logo</Text>
        <Spacer />
    <Box w='150px' h='10'>
       <SearchBar />
    </Box>
        <Spacer />
    <Box paddingTop={1} paddingRight={2}>
        <DarkModeSwitch />
    </Box>
  </Flex>
  )
}

export default NavBar