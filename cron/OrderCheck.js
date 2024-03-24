const generateCounterOrderLiqPool = require('../function/generateCounterOrderLiqPool');
const CheckOrders = require('../service/checkOrders.js');

const CronJob = require('cron').CronJob;

const checkOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    await CheckOrders();
    await generateCounterOrderLiqPool();
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkOrders;