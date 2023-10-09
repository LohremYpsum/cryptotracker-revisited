import axios from 'axios';
import { useEffect, useState } from 'react'

export interface FetchCoins {
    id: string;
    name: string; 
    symbol: string;
    current_price: number;
    ath: number; 
    image: string; 
    market_cap: number;
 }

const useCoins = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [coinsData, setCryptos] = useState<FetchCoins[]>([]);
    const [error, setError] = useState(null);
  
    // States and Actions
    const initResults = 12;
    const initPage = 1;
    const initCurrency = 'eur';
    const [count, setCount] = useState(initResults);
    const [page, setPage] = useState(initPage);
    const [currency, setCurrency] = useState(initCurrency); // eur is true
     // Call API Endpoint (Refactor to Hooks Folder)
     useEffect(() => {
        const baseUrl = `https://api.coingecko.com/api/v3`;
      
        axios
          .get<FetchCoins[]>(
            `${baseUrl}/coins/markets?&page=${page}&per_page=${count}&vs_currency=${
              currency ? 'eur' : 'usd'
            }&order=market_cap_desc&sparkline=false`
          )
          .then((response) => {
            const cryptoData = response.data;
            setIsLoaded(true);
            setCryptos(cryptoData);
          })
          .catch((error) => {
            setIsLoaded(true);
            setError(error);
          });
      }, [count, page, currency]);

  return {coinsData, error, isLoaded, currency }
}

export default useCoins;