const axios = require('axios');
const CoinGecko = require('coingecko-api');
const { getPriceCoinInBip } = require('./minterTransaction');

const CoinGeckoClient = new CoinGecko();

const getMinterCoinRate = async (currency) => {
  try {
    const convertId = {
      uah: 2824,
      try: 2810,
      rub: 2806
    };

    const config = {
      method: 'get',
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/category?id=604f2762ebccdd50cd175fcc&convert_id=${convertId[currency]}`,
      headers: { 
        'X-CMC_PRO_API_KEY': 'b5e3ae62-2e9c-42fd-9471-777582509a1e'
      }
    };
    
    const responce = await axios.request(config);
    const dataBip = (responce.data.data.coins).filter((el) => el.id === 4957);
    const priceBip = dataBip[0].quote[`${convertId[currency]}`].price;

    console.log('price bip', +priceBip, currency);

    const priceHubInBip = await getPriceCoinInBip('hub');
    const priceMontserhubInBip = await getPriceCoinInBip('MONSTERHUB');
    
    console.log('price hub', priceHubInBip, 'BIP');
    console.log('price monsterhub', priceMontserhubInBip, 'BIP');

    const priceAllCoin = {
      bip: +priceBip,
      hub: +priceBip * priceHubInBip,
      monsterhub: +priceBip * priceMontserhubInBip
    }

    console.log(priceAllCoin);


    return priceAllCoin

  } catch (error) {
    console.error(error);
    return {
      bip: 0,
      hub: 0,
      monsterhub: 0
    }
  }
};

const getAllCoinRate = async (currency) => {
  try {
    const data = await CoinGeckoClient.simple.price({
      ids: ['plex', 'crossfi-2', 'artery', 'decimal', 'tether', 'binancecoin'],
      vs_currencies: [`${currency}`],
    });

    const coinGecRate = data.data;
    const priceMinterCoin = await getMinterCoinRate(currency);


    const responce = await axios.get('https://mainnet-explorer-api.decimalchain.com/api/coins?limit=1000');
    const rateDecimalCoin = responce.data.result.coins;

    const rateToCurr = {
      cashback: null,
      ddao: null,
      del: coinGecRate.decimal[currency],
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
      usdt: coinGecRate.tether[currency],
      mine: 0.000092,
      plex: coinGecRate.plex[currency],
      mpx: 1.84,
      xfi: coinGecRate['crossfi-2'][currency],
      artery: coinGecRate.artery[currency],
      bip: priceMinterCoin.bip,
      usdtbsc: coinGecRate.tether[currency],
      monsterhub: priceMinterCoin.monsterhub,
      bnb: coinGecRate.binancecoin[currency],
      hub: priceMinterCoin.hub
    };

    for (const symbol in rateToCurr) {
      // Поиск объекта в массиве rateDecimalCoin с соответствующим title
      const foundItem = rateDecimalCoin.find(item => item.symbol === symbol);

      // Если объект найден, присвоить значение из price свойству объекта rateToCurr
      if (foundItem) {
        rateToCurr[symbol] = Number(foundItem.price) * rateToCurr.del;
      };
    };

    return rateToCurr

  } catch (error) {
    console.error(error);
  }
};

module.exports = getAllCoinRate;
