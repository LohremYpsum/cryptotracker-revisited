import { Switch, useColorMode } from '@chakra-ui/react';

const DarkModeSwitch = () => {

    const {colorMode, toggleColorMode } = useColorMode();

  return (
    <Switch
      colorScheme='red'
      aria-label='Toggle dark mode'
      isChecked={colorMode === 'dark'}
      onChange={toggleColorMode}
    />
  )
}

export default DarkModeSwitch
