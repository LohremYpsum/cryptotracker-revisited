import { Button, Flex, Select, Text } from '@chakra-ui/react'

const PAGE_SIZES = [10, 25, 50]

interface PaginationProps {
  page: number;
  count: number;
  /** Rows the current page actually returned; a short page means the end of the list. */
  loadedRows: number;
  isLoaded: boolean;
  onPageChange: (page: number) => void;
  onCountChange: (count: number) => void;
}

const Pagination = ({ page, count, loadedRows, isLoaded, onPageChange, onCountChange }: PaginationProps) => {

  // CoinGecko reports no total, so "there is a next page" can only be inferred
  // from whether this page came back full.
  const hasNextPage = loadedRows === count;

  return (
    <Flex alignItems='center' gap={3} paddingTop={4} paddingBottom={2} wrap='wrap'>
      <Button
        size='sm'
        onClick={() => onPageChange(page - 1)}
        isDisabled={page <= 1 || isLoaded}
      >
        Previous
      </Button>

      <Text fontSize='sm'>Page {page}</Text>

      <Button
        size='sm'
        onClick={() => onPageChange(page + 1)}
        isDisabled={!hasNextPage || isLoaded}
      >
        Next
      </Button>

      <Select
        size='sm'
        w='130px'
        aria-label='Coins per page'
        value={count}
        onChange={(event) => onCountChange(Number(event.target.value))}
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size} per page
          </option>
        ))}
      </Select>
    </Flex>
  )
}

export default Pagination
