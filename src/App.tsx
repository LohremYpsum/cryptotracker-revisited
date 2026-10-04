import { useMemo, useState } from 'react'
import { Box, Container, Stack } from '@chakra-ui/react'
import NavBar from './components/commons/NavBar'
import TableOverview from './components/TableOverview'

import PiechartMarketCap from './components/charts/PiechartMarketCap'
import PiechartCirculatingSupply from './components/charts/PiechartCirculatingSupply'
import BarchartAthChange from './components/charts/BarchartAthChange'
import PiechartTradeVolume from './components/charts/PiechartTradeVolume'

import useCoins from './hooks/useCoins'
import { filterCoins } from './utils/filterCoins'


function App() {
  
  // Fetch Coins once for the whole page and pass them down.
  const {coinsData, error, isLoaded, currency, count, page, setCount, setPage, setCurrency} = useCoins();

  const [searchTerm, setSearchTerm] = useState('');

  // The search narrows the table only; the charts keep showing the whole page.
  const visibleCoins = useMemo(() => filterCoins(coinsData, searchTerm), [coinsData, searchTerm]);

  return (
    <Box>
      <NavBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      <Container maxW={1200}>
       <TableOverview
         coinsData={visibleCoins}
         error={error}
         currency={currency}
         page={page}
         count={count}
         isLoaded={isLoaded}
         loadedRows={coinsData.length}
         onPageChange={setPage}
         onCountChange={setCount}
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
          <PiechartTradeVolume cryptos={coinsData} chartTitle={'Current Trading Volume (absolute)'}/>
        </Box>
      </Stack>

  
      </Container>
      
    </Box>
  )
}

export default App
