import { CronJob } from "cron";
import TransactionUsdtStatus from "../../models/trc20/modelTransactionsUsdtStatus";
import WalletUser from "../../models/user/WalletUser";
import sleep from "../../function/sleepFunction";
import ReplenishmentTrc20Service from '../../service/blockchain/trc20/ReplenishmentService'


export const checkUserUsdtTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUser.find({});

    for (const user of wallets) {
      await sleep(10000);
      await ReplenishmentTrc20Service.ReplenishmentTrc20(user.id);
    }
  } catch (error) {
    console.error("usdt check error:", error.message);
  }
});

export const chechAdminUsdtTransaction = new CronJob('0 */2 * * * *', async () => {
  try {
    const allTransactions = await TransactionUsdtStatus.find();

    for (const tx of allTransactions) {
      await ReplenishmentTrc20Service.CheckUsdtTransactionAmin(tx);
    }
  } catch (error) {
    console.error("usdt check error:", error.message);
  }
})
