import { useMemo } from 'react'
import { Box, Container, Stack } from '@chakra-ui/react'
import TableOverview from '../components/TableOverview'

import PiechartMarketCap from '../components/charts/PiechartMarketCap'
import PiechartCirculatingSupply from '../components/charts/PiechartCirculatingSupply'
import BarchartAthChange from '../components/charts/BarchartAthChange'
import PiechartTradeVolume from '../components/charts/PiechartTradeVolume'

import type { FetchCoins } from '../hooks/useCoins'
import { filterCoins } from '../utils/filterCoins'

interface OverviewProps {
    coinsData: FetchCoins[];
    searchTerm: string;
    error: string | null;
    currency: string;
    page: number;
    count: number;
    isLoaded: boolean;
    onPageChange: (page: number) => void;
    onCountChange: (count: number) => void;
}

const Overview = ({
    coinsData,
    searchTerm,
    error,
    currency,
    page,
    count,
    isLoaded,
    onPageChange,
    onCountChange,
}: OverviewProps) => {

    // The search narrows the table only; the charts keep showing the whole page.
    const visibleCoins = useMemo(() => filterCoins(coinsData, searchTerm), [coinsData, searchTerm]);

    return (
        <Container maxW={1200}>
            <TableOverview
                coinsData={visibleCoins}
                error={error}
                currency={currency}
                page={page}
                count={count}
                isLoaded={isLoaded}
                loadedRows={coinsData.length}
                onPageChange={onPageChange}
                onCountChange={onCountChange}
            />

            <Stack direction={['column', 'row']} spacing='24px' paddingBottom={50}>
                <Box flex='1' minW={0} paddingTop={25}>
                    <PiechartMarketCap cryptos={coinsData} chartTitle={'Market Capitalisation (absolute)'} />
                </Box>
                <Box flex='1' minW={0} paddingTop={25}>
                    <PiechartCirculatingSupply cryptos={coinsData} chartTitle={'Circulating Supply (absolute)'} />
                </Box>
            </Stack>

            <Stack direction={['column', 'row']} spacing='24px'>
                <Box flex='1' minW={0} paddingTop={25}>
                    <BarchartAthChange cryptos={coinsData} chartTitle={'ATH Change in %'} />
                </Box>
                <Box flex='1' minW={0} paddingTop={25}>
                    <PiechartTradeVolume cryptos={coinsData} chartTitle={'Current Trading Volume (absolute)'} />
                </Box>
            </Stack>
        </Container>
    )
}

export default Overview
