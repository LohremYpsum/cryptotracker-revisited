import { TableContainer, Text } from '@chakra-ui/react'
import MainTable from './MainTable';
import Pagination from './Pagination';
import type { FetchCoins } from '../hooks/useCoins';

interface TableOverviewProps {
    coinsData: FetchCoins[];
    error: string | null;
    currency: string;
    page: number;
    count: number;
    isLoaded: boolean;
    onPageChange: (page: number) => void;
    onCountChange: (count: number) => void;
}

const TableOverview = ({
    coinsData,
    error,
    currency,
    page,
    count,
    isLoaded,
    onPageChange,
    onCountChange,
}: TableOverviewProps) => {

    return (
    <TableContainer>
        {error && <Text>{error}</Text>}

        <MainTable coinsData={coinsData} currency={currency} />

        <Pagination
            page={page}
            count={count}
            loadedRows={coinsData.length}
            isLoaded={isLoaded}
            onPageChange={onPageChange}
            onCountChange={onCountChange}
        />

    </TableContainer>
  )
}

export default TableOverview
