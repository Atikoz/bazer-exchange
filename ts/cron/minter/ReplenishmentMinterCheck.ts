import { CronJob } from 'cron';
import WalletUserModel from '../../model/modelWallet';
import { IUserWallets } from '../../interface/UserInterfaces';
import ReplenishmentMinter from '../../service/replenishment/replenishmentMinter';


const checkMinterTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets: IUserWallets[] = await WalletUserModel.find({});
    wallets.forEach(async (w) => { await ReplenishmentMinter.checkUserTransaction(w.id) });

    await ReplenishmentMinter.balanceCheckAdminWallet();
  } catch (error) {
    console.error(error)
  }
});

export default checkMinterTransaction;