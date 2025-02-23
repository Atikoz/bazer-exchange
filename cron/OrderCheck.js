const generateCounterOrderDoubleLiqPool = require('../function/liquidityPool/generateCounterOrderDoubleLiqPool.js');
const generateCounterOrderLiqPool = require('../function/liquidityPool/generateCounterOrderLiqPool.js');
const CheckOrders = require('../service/checkOrders.js');

const CronJob = require('cron').CronJob;

const checkOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    await CheckOrders();
    await generateCounterOrderLiqPool();
    await generateCounterOrderDoubleLiqPool();
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkOrders;