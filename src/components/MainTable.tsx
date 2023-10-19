import { Table, TableCaption, Thead, Tr, Th, Tbody, Td, Image, Button, Link} from '@chakra-ui/react'
import { FetchCoins } from '../hooks/useCoins';

interface MainTableProps {
    coinsData: FetchCoins[];
    currency: string;
  }

const MainTable = ({coinsData, currency}: MainTableProps) => {

  return (
    <Table variant='striped' colorScheme='teal'>
    <TableCaption></TableCaption>
    <Thead>
    <Tr>
        <Th>
          Logo
        </Th>
        <Th>Currency Name</Th>
        <Th>Ticker Symbol</Th>
        <Th isNumeric>current Price</Th>
        <Th isNumeric>All-Time High</Th>
        <Th>Optionen</Th>
    </Tr>
    </Thead>

    <Tbody>
    {coinsData.map( (singleEntry) => (
        <Tr key={singleEntry.id}>
        <Td>
            <Image boxSize='32px' borderRadius={8} src={singleEntry.image} />
        </Td>
        <Td>{singleEntry.name}</Td>
        <Td>{singleEntry.symbol.toUpperCase()}</Td>
        <Td isNumeric>
            {singleEntry.current_price} {currency ? '€' : '$'}
        </Td>
        <Td isNumeric>
            {singleEntry.ath} {currency ? '€' : '$'}
        </Td>
        <Td>
          <Button>
            <Link href={`toDo-coinDetails/${singleEntry.id}`} isExternal>Details</Link>
          </Button>
        </Td>
        </Tr>
    ))}
    
    </Tbody>
   
</Table>
  )
}

export default MainTable