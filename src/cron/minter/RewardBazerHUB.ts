import { CronJob } from 'cron';
import RewardMinterServise from '../../service/blockchain/minter/rewardMinterService'

const rewardMinter = new CronJob('0 0 14 * * 1', async () => {
  try {
    await RewardMinterServise.accrualRewards();
  } catch (error) {
    console.error(error)
  }
});

export default rewardMinter;