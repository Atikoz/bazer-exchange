import { CronJob } from "cron";
import { IReferralUser, RefferalService } from "../../service/user/ReferralService";

export function startReferralUpdateJob() {
  const job = new CronJob('*/1 * * * *', async () => {
    console.log('⏰ Updating referral system cache...');

    try {
      const users: IReferralUser[] = await RefferalService.fetchReferralTree();
      RefferalService.setReferralCache(users);
      console.log(`✅ Referral system updated. Users: ${users.length}`);
    } catch (error) {
      console.error('❌ Failed to update referral system:', error);
    }
  });

  job.start();
}