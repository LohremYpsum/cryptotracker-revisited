import { Switch, useColorMode } from '@chakra-ui/react';

interface CustomColorModeContextType {
    colorMode: 'light' | 'dark';
    toggleColorMode: () => void;
  }

const DarkModeSwitch = () => {

    const {colorMode, toggleColorMode } = useColorMode() as CustomColorModeContextType;

  return (
    <Switch colorScheme='red' isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
  )
}

export default DarkModeSwitch