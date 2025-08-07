import { CronJob } from "cron";
import TransactionUsdtStatus from "../../models/trc20/modelTransactionsUsdtStatus";
import WalletUser from "../../models/user/WalletUser";
import sleep from "../../function/sleepFunction";
import ReplenishmentTrc20Service from '../../service/blockchain/trc20/ReplenishmentService'


export const checkUserUsdtTransaction = new CronJob('0 */1 * * * *', async () => {
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
      console.log('ℹ️ Нет активных пользователей для проверки TRC20 транзакций.');
      return;
    }

    for (const user of activeWallets) {
      await sleep(10000);
      await ReplenishmentTrc20Service.ReplenishmentTrc20(user.id)
    }
  } catch (error) {
    console.error("usdt check error:", error.message);
  }
});

export const chechAdminUsdtTransaction = new CronJob('0 */2 * * * *', async () => {
  try {
    const allTransactions = await TransactionUsdtStatus.find({ status: { $nin: ['Done', 'Fail'] } });

    for (const tx of allTransactions) {
      await ReplenishmentTrc20Service.CheckUsdtTransactionAmin(tx);
    }
  } catch (error) {
    console.error("usdt check error:", error.message);
  }
})
