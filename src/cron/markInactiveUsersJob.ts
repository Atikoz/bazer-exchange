import { CronJob } from 'cron';
import User from '../models/user/UserModel';


export const markInactiveUsersJob = new CronJob('0 3 * * *', async () => {
  try {
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await User.updateMany(
      { lastActivity: { $lt: THIRTY_DAYS_AGO }, isActive: true },
      { isActive: false }
    );

    console.log(`✅ [InactiveJob] Позначено неактивними: ${result.modifiedCount}`);
  } catch (error) {
    console.error('❌ [InactiveJob] Помилка:', error.message);
  }
});