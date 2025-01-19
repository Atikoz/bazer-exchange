const mongoose = require('mongoose');
const config = require('../config');
const MinterService = require('../service/minter/MinterService');

const main = async () => {
  try {
    console.log('test start');
    mongoose.connect(config.dataBaseUrl);

    await MinterService.getCommissionTx()
  } catch (error) {
    console.error(error);
    console.log('test error');
  }
}

(async () => {
  await main();
})();