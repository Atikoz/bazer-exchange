import { CronJob } from 'cron';
import WalletUserModel from '../../model/modelWallet';
import ReplenishmentDecimal from '../../service/replenishment/replenishmentDecimal';
import TransactionStatus from '../../model/decimal/modelTransactionStatus';
import { IUserWallets } from '../../interface/UserInterfaces';


interface TransactionDecimalSendAdmin {
  id: string,
  hash: string,
  status: string,
  amount: number,
  processed: boolean,
}

const checkUserTransaction = new CronJob('0 */1 * * * *', async ():Promise<void> => {
  try {
    const wallets: IUserWallets[] = await WalletUserModel.find({});
    wallets.map(async (w) => {
      await ReplenishmentDecimal.ReplenishmentUserWallet(w.id)
    });
    const status: TransactionDecimalSendAdmin[] = await TransactionStatus.find({});
    status.map(async (t) => {
      if (t.status === 'Done' && t.processed) return;
      await ReplenishmentDecimal.CheckBalanceAdmin(t.hash, +t.id, t.amount)
  });
  } catch (error) {
    console.error(error)
  }
});

export default checkUserTransaction;