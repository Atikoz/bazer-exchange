import { CronJob } from 'cron';
import WalletUser from '../../models/user/WalletUser';
import ReplenishmentMinter from '../../service/blockchain/minter/ReplenishmentService';

const checkMinterTransaction = new CronJob('0 */1 * * * *', async () => {
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
      console.log('ℹ️ Нет активных пользователей для проверки MINTER транзакций.');
      return;
    }

    for (const user of activeWallets) {
      await ReplenishmentMinter.checkUserTransaction(user.id)
    }

    await ReplenishmentMinter.checkAdminWallet();
  } catch (error) {
    console.error(error)
  }
});

export default checkMinterTransaction;