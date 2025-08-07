import { CronJob } from 'cron';
import WalletUser from '../../models/user/WalletUser';
import ArteryReplenishment from '../../models/artery/modelArterySendAdmin';
import ArteryService from '../../service/blockchain/artery/ateryService';

const CRON_EVERY_MINUTE = '0 */1 * * * *';


export const checkArtrBalance = new CronJob(CRON_EVERY_MINUTE, async () => {
  try {
    const activeWallets = await WalletUser.aggregate([
      {
        $addFields: {
          idStr: { $toString: '$id' } // конвертуємо id в рядок
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'idStr',        // тепер порівнюємо як рядки
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true } }
    ]);


    if (!activeWallets.length) {
      console.log('ℹ️ Нет активных пользователей для проверки ARTERY транзакций.');
      return;
    }

    for (const user of activeWallets) {
      await ArteryService.checkUserBalance(user.id, user.mnemonic, user.artery.address)
    }
  } catch (error) {
    console.error(error)
  }
});

export const checkArtrAdminHash = new CronJob(CRON_EVERY_MINUTE, async () => {
  try {
    const allTransactions = await ArteryReplenishment.find({ status: { $ne: 'Done' } });

    for (let i = 0; i < allTransactions.length; i++) {
      await ArteryService.checkAdminWallet(allTransactions[i]);
    }
  } catch (error) {
    console.error(error)
  }
});