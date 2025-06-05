import { CronJob } from 'cron';
import WalletUser from '../../models/user/WalletUser';
import ArteryReplenishment from '../../models/artery/modelArterySendAdmin';
import ArteryService from '../../service/blockchain/artery/ateryService';

const CRON_EVERY_MINUTE = '0 */1 * * * *';


export const checkArtrBalance = new CronJob(CRON_EVERY_MINUTE, async () => {
  try {
    const wallets = await WalletUser.find({});
    
    await Promise.all(wallets.map(w =>
      ArteryService.checkUserBalance(w.id, w.mnemonic, w.artery.address)
    ));
  } catch (error) {
    console.error(error)
  }
});

export const checkArtrAdminHash = new CronJob(CRON_EVERY_MINUTE, async () => {
  try {
    const allTransactions = await ArteryReplenishment.find({});

    for (let i = 0; i < allTransactions.length; i++) {
      await ArteryService.checkAdminWallet(allTransactions[i]);
    }
  } catch (error) {
    console.error(error)
  }
});