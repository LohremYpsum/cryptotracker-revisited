import { Stack, InputGroup, InputLeftElement, Input, Icon } from '@chakra-ui/react'
import { CiSearch } from "react-icons/ci";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return (
    <Stack spacing={12}>
    <InputGroup>
        <InputLeftElement pointerEvents='none'>
        <Icon as={CiSearch} />
        </InputLeftElement>
        <Input
          type='text'
          placeholder='Search coin'
          aria-label='Search coin'
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
    </InputGroup>
    </Stack>
  )
}

export default SearchBar
