import { CronJob } from "cron";
import { RewardDistributorService } from "../../service/blockchain/crossfi/RewardDistributorService";

export function startRewardDistributionJob() {
  const job = new CronJob('0 14 * * *', async () => {
    console.log('⏰ Запуск щоденного розподілу ревардів...');

    try {
      const distributor = new RewardDistributorService();
      await distributor.distributeRewards();
    } catch (error) {
      console.error('❌ Failed to distribute crossfi rewards:', error);
    }
  });

  job.start();
}
