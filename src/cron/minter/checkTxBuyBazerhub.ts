import { CronJob } from 'cron';
import RewardMinterServise from '../../service/blockchain/minter/rewardMinterService'

const accrualPurchasesBuyBazerhub = new CronJob('0 */1 * * * *', async () => {
  try {
    await RewardMinterServise.checkTxBuyBazerHub();
  } catch (error) {
    console.error(error)
  }
});

export default accrualPurchasesBuyBazerhub;
