import { IUserWallets } from '../../interface/UserInterfaces';
import { CronJob } from 'cron';
import WalletUserModel from '../../model/modelWallet';
import ReplenishmentMinePlex from '../../service/replenishment/replenishmentMinePlex';
import TransactionMinePlexStatusModel from '../../model/minePlex/modelMinePlexStatusTransactions';
import HashSendAdminComissionModel from '../../model/minePlex/modelHashSendAdminComission';

interface ISendAdminTransacion {
  id: string,
  hash: string,
  status: string,
  amount: number,
  coin: string
}

export const checkUserMinePlexTransaction = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const wallets: IUserWallets[] = await WalletUserModel.find({});
    wallets.map(async (w) => { await ReplenishmentMinePlex.ReplenishmentUserWallet(w.id); });
  } catch (error) {
    console.error(error)
  }
});

export const chechAdminMinePlexTransaction = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const allTransactions = await TransactionMinePlexStatusModel.find({})
    for (let i = 0; i < allTransactions.length; i++) {
      await ReplenishmentMinePlex.CheckMinePlexTransactionAmin(allTransactions[i]);
    };
  } catch (error) {
    console.error(error)
  }
});

export const checkHashSendAdminComission = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const data: ISendAdminTransacion[] = await HashSendAdminComissionModel.find();
    data.map(async (t) => {
      await ReplenishmentMinePlex.CheckCommissionTransactionAmin(t);
    })
  } catch (error) {
    console.error(error)
  }
});