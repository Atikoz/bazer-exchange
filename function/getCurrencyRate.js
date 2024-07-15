const axios = require('axios');
const CoinGecko = require('coingecko-api');
const { apiKeyCoinMarketCap } = require('../config');

const CoinGeckoClient = new CoinGecko();

const getMinterCoinRate = async () => {
  try {
    const rateHub = {
      uah: 135.40,
      try: 109.54,
      rub: 285.16
    };

    const rateMonsterHub = {
      uah: 229.06,
      try: 189.67,
      rub: 542.15
    };

    const rateBipkakxa = {
      uah: 0.026,
      try: 0.022,
      rub: 0.061
    };

    const rateCashbsc = {
      uah: 0.0035,
      try: 0.0028,
      rub: 0.0075
    };

    const rateRuble = {
      uah: 0.11,
      try: 0.094,
      rub: 0.26
    };

    const rateMinterBazerCoin = {
      uah: 0.0099,
      try: 0.0081,
      rub: 0.023
    };

    const convertId = {
      uah: 2824,
      try: 2810,
      rub: 2806
    };

    const priceBip = {
      uah: null,
      try: null,
      rub: null
    };


    for (const currency of Object.keys(convertId)) {
      const config = {
        method: 'get',
        url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/category?id=604f2762ebccdd50cd175fcc&convert_id=${convertId[currency]}`,
        headers: {
          'X-CMC_PRO_API_KEY': apiKeyCoinMarketCap
        }
      };

      const response = await axios.request(config);
      const dataBip = response.data.data.coins.filter(el => el.id === 4957);
      priceBip[currency] = dataBip[0].quote[convertId[currency]].price;
    }

    const priceAllCoin = {
      bip: {
        rub: priceBip.rub,
        try: priceBip.try,
        uah: priceBip.uah,
      },

      hub: {
        rub: rateHub.rub,
        try: rateHub.try,
        uah: rateHub.uah,
      },

      monsterhub: {
        rub: rateMonsterHub.rub,
        try: rateMonsterHub.try,
        uah: rateMonsterHub.uah,
      },

      bipkakaxa: {
        rub: rateBipkakxa.rub,
        try: rateBipkakxa.try,
        uah: rateBipkakxa.uah,
      },

      cashbsc: {
        rub: rateCashbsc.rub,
        try: rateCashbsc.try,
        uah: rateCashbsc.uah,
      },

      minterBazercoin: {
        rub: rateMinterBazerCoin.rub,
        try: rateMinterBazerCoin.try,
        uah: rateMinterBazerCoin.uah,
      },

      ruble: {
        rub: rateRuble.rub,
        try: rateRuble.try,
        uah: rateRuble.uah,
      },

      bazerhub: {
        rub: rateHub.rub,
        try: rateHub.try,
        uah: rateHub.uah,
      }
    }

    return priceAllCoin

  } catch (error) {
    console.error(error);
    return {
      bip: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      hub: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      monsterhub: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      bipkakaxa: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      cashbsc: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      minterBazercoin: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      ruble: {
        rub: 0,
        try: 0,
        uah: 0,
      },

      bazerhub: {
        rub: 0,
        try: 0,
        uah: 0,
      }
    }
  }
};

const getAllCoinRate = async () => {
  try {
    const data = await CoinGeckoClient.simple.price({
      ids: ['plex', 'crossfi-2', 'artery', 'decimal', 'tether', 'binancecoin'],
      vs_currencies: ['rub', 'uah', 'try']
    });

    const coinGecRate = data.data;
    const priceMinterCoin = await getMinterCoinRate();

    const responce = await axios.get('https://mainnet-explorer-api.decimalchain.com/api/coins?limit=1000');
    const rateDecimalCoin = responce.data.result.coins;

    const rateToCurr = {
      rub: {
        cashback: null,
        ddao: null,
        del: coinGecRate.decimal.rub,
        delkakaxa: null,
        converter: null,
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
        bip: priceMinterCoin.bip.rub,
        usdtbsc: coinGecRate.tether.rub,
        monsterhub: priceMinterCoin.monsterhub.rub,
        bnb: coinGecRate.binancecoin.rub,
        hub: priceMinterCoin.hub.rub,
        bipkakaxa: priceMinterCoin.bipkakaxa.rub,
        cashbsc: priceMinterCoin.cashbsc.rub,
        minterBazercoin: priceMinterCoin.minterBazercoin.rub,
        ruble: priceMinterCoin.ruble.rub,
        bazerhub: priceMinterCoin.hub.rub,

      },
      uah: {
        cashback: null,
        ddao: null,
        del: coinGecRate.decimal.uah,
        delkakaxa: null,
        converter: null,
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
        usdt: coinGecRate.tether.uah,
        mine: 0.000092,
        plex: coinGecRate.plex.uah,
        mpx: 1.84,
        xfi: coinGecRate['crossfi-2'].uah,
        artery: coinGecRate.artery.uah,
        bip: priceMinterCoin.bip.uah,
        usdtbsc: coinGecRate.tether.uah,
        monsterhub: priceMinterCoin.monsterhub.uah,
        bnb: coinGecRate.binancecoin.uah,
        hub: priceMinterCoin.hub.uah,
        bipkakaxa: priceMinterCoin.bipkakaxa.uah,
        cashbsc: priceMinterCoin.cashbsc.uah,
        minterBazercoin: priceMinterCoin.minterBazercoin.uah,
        ruble: priceMinterCoin.ruble.uah,
        bazerhub: priceMinterCoin.hub.uah
      },
      try: {
        cashback: null,
        ddao: null,
        del: coinGecRate.decimal.try,
        delkakaxa: null,
        converter: null,
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
        usdt: coinGecRate.tether.try,
        mine: 0.000092,
        plex: coinGecRate.plex.try,
        mpx: 1.84,
        xfi: coinGecRate['crossfi-2'].try,
        artery: coinGecRate.artery.try,
        bip: priceMinterCoin.bip.try,
        usdtbsc: coinGecRate.tether.try,
        monsterhub: priceMinterCoin.monsterhub.try,
        bnb: coinGecRate.binancecoin.try,
        hub: priceMinterCoin.hub.try,
        bipkakaxa: priceMinterCoin.bipkakaxa.try,
        cashbsc: priceMinterCoin.cashbsc.try,
        minterBazercoin: priceMinterCoin.minterBazercoin.try,
        ruble: priceMinterCoin.ruble.try,
        bazerhub: priceMinterCoin.hub.try,

      }
    };

    for (const currency in rateToCurr) {
      const currencyObject = rateToCurr[currency];

      for (const symbol in currencyObject) {
        // Пошук об'єкта в масиві rateDecimalCoin з відповідним title
        const foundItem = rateDecimalCoin.find(item => item.symbol === symbol);

        // Якщо об'єкт знайдено, обчислити нове значення та присвоїти його до відповідного символу в об'єкті currencyObject
        if (foundItem) {
          currencyObject[symbol] = Number(foundItem.price) * currencyObject.del;
        }
      }
    }

    return rateToCurr

  } catch (error) {
    console.error('get currency rate', error.message);
  }
};

module.exports = getAllCoinRate;
