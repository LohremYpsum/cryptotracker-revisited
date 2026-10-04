import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import NavBar from './components/commons/NavBar'
import Overview from './pages/Overview'
import CoinDetail from './pages/CoinDetail'

import useCoins from './hooks/useCoins'


function App() {

  // Fetch Coins once for the whole page and pass them down. The state lives
  // above the routes, so navigating to a coin and back costs no request.
  const {coinsData, error, isLoaded, currency, count, page, setCount, setPage, setCurrency} = useCoins();

  const [searchTerm, setSearchTerm] = useState('');

  // The search filters the table, which only the overview has. The term itself
  // survives the detour so the table looks the same on the way back.
  const showSearch = useLocation().pathname === '/';

  return (
    <Box>
      <NavBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currency={currency}
        onCurrencyChange={setCurrency}
        showSearch={showSearch}
      />

      <Routes>
        <Route
          path='/'
          element={
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
          }
        />
        <Route
          path='/coin/:id'
          element={
            <CoinDetail
              coinsData={coinsData}
              currency={currency}
              error={error}
              isLoaded={isLoaded}
            />
          }
        />
        {/* No id to show: send the user to the table rather than a blank page. */}
        <Route path='/coin' element={<Navigate to='/' replace />} />
      </Routes>

    </Box>
  )
}

export default App
