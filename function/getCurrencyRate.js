const CoinGecko = require('coingecko-api');
const { apiKeyCoinMarketCap } = require('../config');
const fromBaseUnit = require('../helpers/count/fromBaseUnit');
const BalanceUserModel = require('../model/user/modelBalance');
const CoinGeckoClient = new CoinGecko();


class RateService {
  async getMinterCoinPrice() {
    try {
      const rates = {
        hub: { uah: 86.76, try: 73.25, rub: 211.15 },
        monsterhub: { uah: 103.47, try: 87.36, rub: 251.82 },
        bipkakaxa: { uah: 0.042, try: 0.035, rub: 0.10 },
        cashbsc: { uah: 0.010, try: 0.0085, rub: 0.024 },
        ruble: { uah: 0.41, try: 0.34, rub: 0.99 },
        minterBazercoin: { uah: 0.11, try: 0.092, rub: 0.27 },
      };

      const convertId = {
        uah: 2824,
        try: 2810,
        rub: 2806
      };

      const priceBip = await this.fetchBipPrice(convertId);

      rates.bip = priceBip

      return rates

    } catch (error) {
      console.error(`error geting minter coin price: ${error.message}`);
    }
  }

  async fetchBipPrice(currencyIdObject) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("X-CMC_PRO_API_KEY", apiKeyCoinMarketCap);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const bipRate = {}

      for (const currency in currencyIdObject) {
        const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/category?id=604f2762ebccdd50cd175fcc&convert_id=${currencyIdObject[currency]}`, requestOptions);
        const resultApi = await response.json();

        const dataBip = resultApi.data.coins.filter(el => el.id === 4957);
        const priceBip = dataBip[0].quote[currencyIdObject[currency]].price;

        bipRate[currency] = priceBip
      }

      return bipRate
    } catch (error) {
      console.error(`error fetching bip price: ${error.message}`);

      return {
        uah: 0,
        try: 0,
        rub: 0
      }
    }
  }

  async getDecimalCoinPrice() {
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const response = await fetch('https://api.decimalchain.com/api/v1/coins/coins?limit=1000&offset=0', requestOptions)
      const resultApi = await response.json();

      const coinList = resultApi.Result[0].coins;

      return coinList
    } catch (error) {
      console.error(`error geting decimal coin price: ${error.message}`);

      return []
    }
  }

  async getCoinPrice() {
    try {
      const data = await CoinGeckoClient.simple.price({
        ids: ['plex', 'crossfi-2', 'artery', 'decimal', 'tether', 'binancecoin'],
        vs_currencies: ['rub', 'uah', 'try']
      });

      const coinGecPrice = data.data;
      const decimalCoinPrice = await this.getDecimalCoinPrice();
      const priceMinterCoin = await this.getMinterCoinPrice();

      const rateToCurr = {
        rub: {
          del: coinGecPrice.decimal.rub,
          usdt: coinGecPrice.tether.rub,
          mine: 0.000092,
          plex: coinGecPrice.plex.rub,
          mpx: 2.05,
          xfi: coinGecPrice['crossfi-2'].rub,
          artery: coinGecPrice.artery.rub,
          bip: priceMinterCoin.bip.rub,
          usdtbsc: coinGecPrice.tether.rub,
          monsterhub: priceMinterCoin.monsterhub.rub,
          bnb: coinGecPrice.binancecoin.rub,
          hub: priceMinterCoin.hub.rub,
          bipkakaxa: priceMinterCoin.bipkakaxa.rub,
          cashbsc: priceMinterCoin.cashbsc.rub,
          minterBazercoin: priceMinterCoin.minterBazercoin.rub,
          ruble: priceMinterCoin.ruble.rub,
          bazerhub: priceMinterCoin.hub.rub,
        },
        uah: {
          del: coinGecPrice.decimal.uah,
          usdt: coinGecPrice.tether.uah,
          mine: 0.000092,
          plex: coinGecPrice.plex.uah,
          mpx: 0.8422,
          xfi: coinGecPrice['crossfi-2'].uah,
          artery: coinGecPrice.artery.uah,
          bip: priceMinterCoin.bip.uah,
          usdtbsc: coinGecPrice.tether.uah,
          monsterhub: priceMinterCoin.monsterhub.uah,
          bnb: coinGecPrice.binancecoin.uah,
          hub: priceMinterCoin.hub.uah,
          bipkakaxa: priceMinterCoin.bipkakaxa.uah,
          cashbsc: priceMinterCoin.cashbsc.uah,
          minterBazercoin: priceMinterCoin.minterBazercoin.uah,
          ruble: priceMinterCoin.ruble.uah,
          bazerhub: priceMinterCoin.hub.uah
        },
        try: {
          del: coinGecPrice.decimal.try,
          usdt: coinGecPrice.tether.try,
          mine: 0.000092,
          plex: coinGecPrice.plex.try,
          mpx: 0.7114,
          xfi: coinGecPrice['crossfi-2'].try,
          artery: coinGecPrice.artery.try,
          bip: priceMinterCoin.bip.try,
          usdtbsc: coinGecPrice.tether.try,
          monsterhub: priceMinterCoin.monsterhub.try,
          bnb: coinGecPrice.binancecoin.try,
          hub: priceMinterCoin.hub.try,
          bipkakaxa: priceMinterCoin.bipkakaxa.try,
          cashbsc: priceMinterCoin.cashbsc.try,
          minterBazercoin: priceMinterCoin.minterBazercoin.try,
          ruble: priceMinterCoin.ruble.try,
          bazerhub: priceMinterCoin.hub.try,
        }
      };

      const balanceUser = await BalanceUserModel.findOne();
      const coinList = Object.keys(balanceUser.main);

      for (const currency in rateToCurr) {
        const currencyObject = rateToCurr[currency];

        for (const coin of coinList) {
          if (currencyObject.hasOwnProperty(coin)) {
            continue;
          }

          const foundItem = decimalCoinPrice.find(item => item.symbol === coin);

          if (foundItem) {
            currencyObject[coin] = +fromBaseUnit(foundItem.current_price) * currencyObject.del;
          }
        }
      }

      return rateToCurr
    } catch (error) {
      console.error(`error geting coin price: ${error.message}`)
    }
  }
}

module.exports = new RateService;