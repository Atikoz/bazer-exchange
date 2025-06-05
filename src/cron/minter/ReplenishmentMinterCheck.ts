import { CronJob } from 'cron';
import WalletUser from '../../models/user/WalletUser';
import ReplenishmentMinter from '../../service/blockchain/minter/ReplenishmentService';

const checkMinterTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUser.find({});

    await Promise.all(wallets.map(w =>
      ReplenishmentMinter.checkUserTransaction(w.id)
    ));

    await ReplenishmentMinter.checkAdminWallet();
  } catch (error) {
    console.error(error)
  }
});

export default checkMinterTransaction;