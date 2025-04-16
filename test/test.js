const mongoose = require('mongoose');
const config = require('../config');
const Trc20 = require('../service/trc20/Trc20Service');
const sleep = require('../helpers/sleepFunction');
const Trc20Service = new Trc20;

const main = async () => {
  try {
    console.log('test start');
    mongoose.connect(config.dataBaseUrl);

    // const buyEnergy = await Trc20Service.buyEnergy('TFKxaUEQvYX3dKGFphPvpiWYe3fikx4ZMi')
    // console.log(buyEnergy);
    // await sleep(15000);
    // const send = await Trc20Service.transferCoins(
    //   'bc573a3fd6e7c2235e2f2e1f1239954fb8f53834bb53c6a392516c07a177586a',
    //   'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    //   'THU36Tgr5ADwTXg6ejry8hg4sELiNkHmgA',
    //   1
    // )
    // console.log(send);

    // await Trc20Service.getAccountResources('TDibzDNk1jgqbdBk9ueSKyuVjbWE5EPmaD');
  } catch (error) {
    console.error(error);
    console.log('test error');
  }
}

(async () => {
  await main();
})();