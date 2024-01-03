const axios = require('axios');
const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

const currencyRate = async (sellCoin, buyCoin) => {
  try {
    const data = await CoinGeckoClient.simple.price({
      ids: ['plex', 'crossfi-2', 'artery', 'decimal', 'tether'],
      vs_currencies: ['rub'],
    });

    const coinGecRate = data.data;

    const responce = await axios.get('https://mainnet-explorer-api.decimalchain.com/api/coins?limit=1000');
    const rateDecimalCoin = responce.data.result.coins;

    const rateToRub = {
      cashback: null,
      ddao: null,
      del: coinGecRate.decimal.rub,
      dar: null,
      pro: null,
      sbt: null,
      reboot: null,
      makarovsky: null,
      btt: null,
      dixwell: null,
      avt: null,
      kharat: null,
      byacademy: null,
      patrick: null,
      itcoin: null,
      messege: null,
      rrunion: null,
      vegvisir: null,
      fbworld: null,
      dcschool: null,
      comcoin: null,
      mintcandy: null,
      sirius: null,
      cgttoken: null,
      genesis: null,
      taxicoin: null,
      prosmm: null,
      sharafi: null,
      safecoin: null,
      dtradecoin: null,
      izicoin: null,
      gzacademy: null,
      workout: null,
      zaruba: null,
      magnetar: null,
      candypop: null,
      randomx: null,
      ekology: null,
      emelyanov: null,
      belymag: null,
      doorhan: null,
      lakshmi: null,
      ryabinin: null,
      related: null,
      monopoly: null,
      baroncoin: null,
      nashidela: null,
      irmacoin: null,
      maritime: null,
      business: null,
      randice: null,
      alleluia: null,
      hosanna: null,
      cbgrewards: null,
      novoselka: null,
      monkeyclub: null,
      grandpay: null,
      magnate: null,
      crypton: null,
      iloveyou: null,
      bazercoin: null,
      bazerusd: null,
      usdt: coinGecRate.tether.rub,
      mine: 0.000092,
      plex: coinGecRate.plex.rub,
      mpx: 1.84,
      xfi: coinGecRate['crossfi-2'].rub,
      artery: coinGecRate.artery.rub,
    };

    for (const symbol in rateToRub) {
      // Поиск объекта в массиве rateDecimalCoin с соответствующим title
      const foundItem = rateDecimalCoin.find(item => item.symbol === symbol);

      // Если объект найден, присвоить значение из price свойству объекта rateToRub
      if (foundItem) {
        rateToRub[symbol] = Number(foundItem.price) * rateToRub.del;
      };
    };

    const result = rateToRub[sellCoin] / rateToRub[buyCoin];

    return result
  } catch (error) {
    console.error(error);
  }
};

module.exports = currencyRate;