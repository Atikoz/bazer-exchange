const mongoose = require('mongoose');
const config = require('../config');
const getOrderBook = require('../orderBook/getOrderBook');

const main = async () => {
  try {
    console.log('test start');
    mongoose.connect(config.dataBaseUrl);

    console.log(await getOrderBook('usdt', 'xfi'))
    console.log(await getOrderBook('xfi', 'usdt'))
  } catch (error) {
    console.error(error);
    console.log('test error');
  }
}

(async () => {
  await main();
})();