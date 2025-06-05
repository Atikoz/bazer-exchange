import { CronJob } from 'cron';
import WalletUser from '../../models/user/WalletUser';
import ReplenishmentCrossfi from '../../service/blockchain/crossfi/ReplenishmentService'
import CrossfiSendAdmin from '../../models/crossfi/CrossfiSendAdmin';

export const checkUserCrossfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUser.find({});

    await Promise.all(wallets.map(w =>
      ReplenishmentCrossfi.CheckUserWallet(w.id)
    ));
  } catch (error) {
    console.error(error)
  }
});

export const checkAdminCrossfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const allTransactions = await CrossfiSendAdmin.find();

    for (const tx of allTransactions) {
      await ReplenishmentCrossfi.CheckAdminWallet(tx);
    };
  } catch (error) {
    console.error(error)
  }
});
