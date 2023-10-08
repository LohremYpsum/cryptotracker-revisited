import { Stack, InputGroup, InputLeftElement, Input, Text } from '@chakra-ui/react'
import React from 'react'

const SearchBar = () => {
  return (
    <Stack spacing={12}>
    <InputGroup>
        <InputLeftElement pointerEvents='none'>
        <Text>Icon</Text>
        </InputLeftElement>
        <Input type='text' placeholder='Seach Coin' />
    </InputGroup>
    </Stack>
  )
}

export default SearchBar