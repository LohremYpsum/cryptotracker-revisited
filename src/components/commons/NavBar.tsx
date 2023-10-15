import {Box, Flex, Spacer, Image } from '@chakra-ui/react'
import DarkModeSwitch from './DarkModeSwitch'
import navLogo from '../../assets/NavLogo.webp';
import SearchBar from './SearchBar'

const NavBar = () => {
  return (
    <Flex paddingTop={3}>
      <Image src={navLogo} boxSize='60px' marginLeft={2} borderRadius={8} />
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