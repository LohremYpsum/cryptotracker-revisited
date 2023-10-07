import {Box, Flex, Spacer, Text } from '@chakra-ui/react'
import React from 'react'
import DarkModeSwitch from './DarkModeSwitch'

const NavBar = () => {
  return (
    <Flex>
    
    <Text h={10}>Logo</Text>
    
    <Spacer />
    
    <Box w='120px' h='10' bg='red.500'>
    <Text>Searchbar</Text>
    </Box>
    <Spacer />
    <Box paddingTop={1} paddingRight={2}>
    <DarkModeSwitch />
    </Box>
    
  </Flex>
  )
}

export default NavBar