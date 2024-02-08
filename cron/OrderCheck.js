const generateCounterOrderLiqPool = require('../function/generateCounterOrderLiqPool');
const { SplitOrders, CheckOrders } = require('../service/orders');

const CronJob = require('cron').CronJob;

const checkOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    await SplitOrders();
    await CheckOrders();
    await generateCounterOrderLiqPool();
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkOrders;