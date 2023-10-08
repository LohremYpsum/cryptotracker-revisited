import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Text } from '@chakra-ui/react'
import useCoins from '../hooks/useCoins';


const TableOverview = () => {

    const {coinsData, error, isLoaded, currency} = useCoins()
    

    return (
    <TableContainer>
        {error && <Text>{error}</Text>}

        <Table variant='striped' colorScheme='teal'>
            <TableCaption></TableCaption>
            <Thead>
            <Tr>
                <Th>Logo</Th>
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
                <Td>Pic</Td>
                <Td>{singleEntry.name}</Td>
                <Td>{singleEntry.symbol.toUpperCase()}</Td>
                <Td isNumeric>
                    {singleEntry.current_price} {currency ? '€' : '$'}
                </Td>
                <Td isNumeric>
                    {singleEntry.ath} {currency ? '€' : '$'}
                </Td>
                <Td>1</Td>
                </Tr>
            ))}
            
            </Tbody>
            <Tfoot>
            <Tr>
            
            </Tr>
            </Tfoot>
        </Table>

    </TableContainer>
  )
}

export default TableOverview