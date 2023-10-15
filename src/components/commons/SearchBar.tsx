import { Stack, InputGroup, InputLeftElement, Input, Icon } from '@chakra-ui/react'
import { CiSearch } from "react-icons/ci";


const SearchBar = () => {
  return (
    <Stack spacing={12}>
    <InputGroup>
        <InputLeftElement pointerEvents='none'>
        <Icon as={CiSearch} />
        </InputLeftElement>
        <Input type='text' placeholder='Seach Coin' />
    </InputGroup>
    </Stack>
  )
}

export default SearchBar