const TransactionUsdtStatus = require('../../model/modelTransactionsUsdtStatus');
const WalletUserModel = require('../../model/user/modelWallet.js');
const sleep = require('../../helpers/sleepFunction');
const ReplenishmentTrc20Service = require('../../service/trc20/ReplenishmentService.js')

const CronJob = require('cron').CronJob;

const checkUserUsdtTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});

    for (let i = 0; i < wallets.length; i++) {
      await sleep(10000);
      await ReplenishmentTrc20Service.ReplenishmentTrc20(wallets[i].id);
    }
  } catch (error) {
    console.error("usdt check error:", error.message);
    return

  }
});

const chechAdminUsdtTransaction = new CronJob('0 */2 * * * *', async () => {
  try {
    const allTransactions = await TransactionUsdtStatus.find();

    for (let i = 0; i < allTransactions.length; i++) {
      await ReplenishmentTrc20Service.CheckUsdtTransactionAmin(allTransactions[i]);
    };
  } catch (error) {
    console.error("usdt check error:", error.message);
    return
  }
})

module.exports = {
  checkUserUsdtTransaction,
  chechAdminUsdtTransaction
};