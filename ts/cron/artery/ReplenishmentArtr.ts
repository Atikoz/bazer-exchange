import WalletUserModel from '../../model/modelWallet';
import ReplenishmentArtery, { IArteryTransaction } from '../../function/arteryFunction';
import ArteryReplenishment from '../../model/artery/modelArterySendAdmin';
import { IUserWallets } from '../../interface/UserInterfaces';

import { CronJob } from 'cron';

export const checkArtrBalance = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const wallets: IUserWallets[] = await WalletUserModel.find({});
    wallets.map(async (w) => { await ReplenishmentArtery.checkBalanceArtery(w.id, w.mnemonics, w.artery.address) });
  } catch (error) {
    console.error(error)
  }
});

export const checkArtrAdminHash = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const allTransactions: IArteryTransaction[] = await ArteryReplenishment.find({});
    for (let i = 0; i < allTransactions.length; i++) {
      await ReplenishmentArtery.checkAdminWallet(allTransactions[i]);
    }
  } catch (error) {
    console.error(error)
  }
});