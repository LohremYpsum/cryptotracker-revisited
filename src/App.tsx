import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import NavBar from './components/commons/NavBar'
import Overview from './pages/Overview'

import useCoins from './hooks/useCoins'


function App() {

  // Fetch Coins once for the whole page and pass them down.
  const {coinsData, error, isLoaded, currency, count, page, setCount, setPage, setCurrency} = useCoins();

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box>
      <NavBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      <Overview
        coinsData={coinsData}
        searchTerm={searchTerm}
        error={error}
        currency={currency}
        page={page}
        count={count}
        isLoaded={isLoaded}
        onPageChange={setPage}
        onCountChange={setCount}
      />

    </Box>
  )
}

export default App
