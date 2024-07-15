const checkTxBuyBazerHub = require("../../function/rewardsMinter/ checkTxBuyBazerHub");

const CronJob = require('cron').CronJob;

const accrualPurchasesBuyBazerhub = new CronJob('0 */1 * * * *', async () => {
  try {
    await checkTxBuyBazerHub();
  } catch (error) {
    console.error(error)
  }
});

module.exports = accrualPurchasesBuyBazerhub;
