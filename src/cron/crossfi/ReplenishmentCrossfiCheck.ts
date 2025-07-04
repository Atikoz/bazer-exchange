import { CronJob } from 'cron';
import WalletUser from '../../models/user/WalletUser';
import ReplenishmentCrossfi from '../../service/blockchain/crossfi/ReplenishmentService'
import CrossfiSendAdmin from '../../models/crossfi/CrossfiSendAdmin';

export const checkUserCrossfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const activeWallets = await WalletUser.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'id',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true } }
    ]);

    if (!activeWallets.length) {
      console.log('ℹ️ Нет активных пользователей для проверки CROSSFI транзакций.');
      return;
    }

    for (const user of activeWallets) {
      await ReplenishmentCrossfi.CheckUserWallet(user.id)
    }
  } catch (error) {
    console.error(error)
  }
});

export const checkAdminCrossfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const allTransactions = await CrossfiSendAdmin.find({ status: { $nin: ['Fail, Done'] } });

    for (const tx of allTransactions) {
      await ReplenishmentCrossfi.CheckAdminWallet(tx);
    };
  } catch (error) {
    console.error(error)
  }
});
