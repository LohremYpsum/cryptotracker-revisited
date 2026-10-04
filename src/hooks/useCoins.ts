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

// The error state is rendered straight into JSX, so it has to be a string.
// Handing React an axios error object instead crashes the whole tree.
const toErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (!error.response) return 'Could not reach the CoinGecko API.';
        if (error.response.status === 429) {
            return 'Too many requests to the CoinGecko API. Please wait a moment.';
        }
        return `The market data could not be loaded (HTTP ${error.response.status}).`;
    }
    if (error instanceof Error) return error.message;
    return 'Unknown error while loading the market data.';
};

const useCoins = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [coinsData, setCryptos] = useState<FetchCoins[]>([]);
    const [error, setError] = useState<string | null>(null);
  
    // States and Actions
    const initResults = 10;
    const initPage = 1;
    const initCurrency = 'eur';
    const [count, setCount] = useState(initResults);
    const [page, setPage] = useState(initPage);
    const [currency, setCurrency] = useState(initCurrency);
    

     // Call API Endpoint (Refactor to Hooks Folder)
     useEffect(() => {
        const baseUrl = `https://api.coingecko.com/api/v3`;
        const apiUrl = `/coins/markets?&page=${page}&per_page=${count}&vs_currency=${currency}&order=market_cap_desc&sparkline=false`;

        const controller = new AbortController();
        setIsLoaded(true);
        setError(null);
      
        axios
          .get<FetchCoins[]>(
            baseUrl + apiUrl, {signal: controller.signal}
          )
          .then((response) => {
            const cryptoData = response.data;
            setIsLoaded(false);
            setCryptos(cryptoData);
          })
          .catch((error: unknown) => {
            if(error instanceof CanceledError) return;
            setError(toErrorMessage(error));
            setIsLoaded(false);
          });

          return () => controller.abort();
      }, [count, page, currency]);

  return {coinsData, error, isLoaded, currency, count, page, setCount, setPage, setCurrency }
}

export default useCoins;