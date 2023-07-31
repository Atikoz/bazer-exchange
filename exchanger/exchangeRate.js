const axios = require('axios');

class ExchangeRateCoin {
  async ExchangeRate(coinSell, coinBuy) {
    try {
      if (coinSell === 'del') {
        return (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin_history/${coinBuy}?interval=1d&limit=10`)).data.result.res[0].price;
      };

      if (coinBuy === 'del') {
        return (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin_history/${coinSell}?interval=1d&limit=10`)).data.result.res[0].price;
      };

      const rateSellCoin = (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin_history/${coinSell}?interval=1d&limit=10`)).data.result.res[0].price;
      const rateBuyCoin = (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin_history/${coinBuy}?interval=1d&limit=10`)).data.result.res[0].price;
      const result = rateSellCoin / rateBuyCoin;
      return result
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = new ExchangeRateCoin;