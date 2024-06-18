import { CronJob } from 'cron';
import WalletUserModel from '../../model/modelWallet';
import { IUserWallets } from '../../interface/UserInterfaces';
import ReplenishmentMpxXfi from '../../service/replenishment/replenishmentMpxXfi';
import TransactionMpxXfiStatusModel from '../../model/mpxXfi/modelMpxXfiStatusTransactions';


export const checkUserMpxXfiTransaction = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const wallets: IUserWallets[] = await WalletUserModel.find({});
    wallets.map(async (w) => { await ReplenishmentMpxXfi.ReplenishmentUserWallet(w.id); });
  } catch (error) {
    console.error(error)
  }
});

export const checkAdminMpxXfiTransaction = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const allTransactions = await TransactionMpxXfiStatusModel.find({})
    for (let i = 0; i < allTransactions.length; i++) {
      await ReplenishmentMpxXfi.CheckMinePlexTransactionAmin(allTransactions[i]);
    };
  } catch (error) {
    console.error(error)
  }
});