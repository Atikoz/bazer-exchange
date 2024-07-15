const accrualRewards = require('../../function/rewardsMinter/checkReward');

const CronJob = require('cron').CronJob;

const rewardMinter = new CronJob('0 0 14 * * 1', async () => {
  try {
    await accrualRewards();
  } catch (error) {
    console.error(error)
  }
});

module.exports = rewardMinter;