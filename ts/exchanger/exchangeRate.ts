import axios from 'axios';

interface IExchangeRateResponceApi {
  data: {
    result: {
      current: {
        price: string
      }
    }
  }
}

export async function ExchangeRate(coinSell: string, coinBuy: string): Promise<number | void> {
  try {
    let priceCoin: number = 1;

    if (coinSell === 'del') {
      const responce: IExchangeRateResponceApi = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinBuy}`);
      const rate: number = +responce.data.result.current.price;

      return (priceCoin / rate) * 0.95;
    }
    if (coinBuy === 'del') {
      const responce: IExchangeRateResponceApi = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinSell}`);
      const rate: number = +responce.data.result.current.price;
      priceCoin = rate * 0.95;

      return priceCoin
    };

    const rateSellCoin: IExchangeRateResponceApi = (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinSell}`)).data.result.current.price;
    const rateBuyCoin: IExchangeRateResponceApi = (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinBuy}`)).data.result.current.price;
    const result: number = (+rateSellCoin / +rateBuyCoin) * 0.95;

    return result
  } catch (error) {
    console.error(error);
  }
}

