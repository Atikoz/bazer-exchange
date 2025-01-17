const mongoose = require('mongoose');
const RateService = require('../function/getCurrencyRate');
const config = require('../config');

const main = async () => {
  try {
    console.log('test start');
    mongoose.connect(config.dataBaseUrl);

    await RateService.getCoinPrice()
  } catch (error) {
    console.error(error);
    console.log('test error');
  }
}

(async () => {
  await main();
})();