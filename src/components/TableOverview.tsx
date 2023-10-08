import { TableContainer, Text } from '@chakra-ui/react'
import useCoins from '../hooks/useCoins';
import MainTable from './MainTable';

const TableOverview = () => {

    const {coinsData, error, isLoaded, currency} = useCoins();
    
    return (
    <TableContainer>
        {error && <Text>{error}</Text>}

        <MainTable coinsData={coinsData} currency={currency} />

    </TableContainer>
  )
}

export default TableOverview