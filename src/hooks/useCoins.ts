import axios, { CanceledError } from 'axios';
import { useEffect, useState } from 'react'

export interface FetchCoins {
    id: string;
    name: string; 
    symbol: string;
    current_price: number;
    ath: number; 
    ath_change_percentage: number;
    image: string; 
    market_cap: number;
    circulating_supply: number;
    total_volume: number;
 }

const useCoins = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [coinsData, setCryptos] = useState<FetchCoins[]>([]);
    const [error, setError] = useState(null);
  
    // States and Actions
    const initResults = 10;
    const initPage = 1;
    const initCurrency = 'eur';
    const [count, setCount] = useState(initResults);
    const [page, setPage] = useState(initPage);
    const [currency, setCurrency] = useState(initCurrency); // eur is true
    

     // Call API Endpoint (Refactor to Hooks Folder)
     useEffect(() => {
        const baseUrl = `https://api.coingecko.com/api/v3`;
        const apiUrl = `/coins/markets?&page=${page}&per_page=${count}&vs_currency=${currency ? 'eur' : 'usd'}&order=market_cap_desc&sparkline=false`;

        const controller = new AbortController();
        setIsLoaded(true);
      
        axios
          .get<FetchCoins[]>(
            baseUrl + apiUrl, {signal: controller.signal}
          )
          .then((response) => {
            const cryptoData = response.data;
            setIsLoaded(false);
            setCryptos(cryptoData);
          })
          .catch((error) => {
            if(error instanceof CanceledError) return; 
            setError(error);
            setIsLoaded(false);
          });

          return () => controller.abort();
      }, [count, page, currency, isLoaded]);

  return {coinsData, error, isLoaded, currency }
}

export default useCoins;