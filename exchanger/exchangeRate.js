const axios = require('axios');

class ExchangeRateCoin {
  async ExchangeRate(coinSell, coinBuy) {
    try {
      let priceCoin = 1;

      if (coinSell === 'del') {
        const responce = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinBuy}`);
        const rate = responce.data.result.current.price;

        return (priceCoin / rate) * 0.95;
      }
      if (coinBuy === 'del') {
        const responce = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinBuy}`);
        const rate = responce.data.result.current.price;
        priceCoin = rate * 0.95;

        return priceCoin
      };

      const rateSellCoin = (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinSell}`)).data.result.current.price;
      const rateBuyCoin = (await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/coin/${coinBuy}`)).data.result.current.price;
      const result = (rateSellCoin / rateBuyCoin) * 0.95;
      return result


    } catch (error) {
      console.error();
    }
  }
}

module.exports = new ExchangeRateCoin;