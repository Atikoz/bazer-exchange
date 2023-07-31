const OrderCheck = require('../service/orders');

const CronJob = require('cron').CronJob;

const checkOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    await OrderCheck.SplitOrders();
    await OrderCheck.CheckOrders();
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkOrders;