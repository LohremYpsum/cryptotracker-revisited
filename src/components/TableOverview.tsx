import { TableContainer, Text } from '@chakra-ui/react'
import MainTable from './MainTable';
import type { FetchCoins } from '../hooks/useCoins';

interface TableOverviewProps {
    coinsData: FetchCoins[];
    error: string | null;
    currency: string;
}

const TableOverview = ({coinsData, error, currency}: TableOverviewProps) => {

    return (
    <TableContainer>
        {error && <Text>{error}</Text>}

        <MainTable coinsData={coinsData} currency={currency} />

    </TableContainer>
  )
}

export default TableOverview
