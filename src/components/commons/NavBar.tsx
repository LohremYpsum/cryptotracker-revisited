import {Box, Flex, Spacer, Image } from '@chakra-ui/react'
import DarkModeSwitch from './DarkModeSwitch'
import navLogo from '../../assets/NavLogo.webp';
import SearchBar from './SearchBar'
import CurrencySwitch from './CurrencySwitch'

interface NavBarProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const NavBar = ({ currency, onCurrencyChange }: NavBarProps) => {
  return (
    <Flex paddingTop={3} alignItems='center' gap={2}>
      <Image src={navLogo} boxSize='60px' marginLeft={2} borderRadius={8} />
        <Spacer />
    <Box w='150px' h='10'>
       <SearchBar />
    </Box>
        <Spacer />
    <Box w='110px'>
        <CurrencySwitch currency={currency} onCurrencyChange={onCurrencyChange} />
    </Box>
    <Box paddingRight={2}>
        <DarkModeSwitch />
    </Box>
  </Flex>
  )
}

export default NavBar
