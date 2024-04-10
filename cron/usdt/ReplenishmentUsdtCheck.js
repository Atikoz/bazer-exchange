const { resolve } = require('mathjs');
const TransactionUsdtStatus = require('../../model/modelTransactionsUsdtStatus');
const WalletUserModel = require('../../model/modelWallet');
const { ReplenishmentUserWalletUSDT, CheckUsdtTransactionAmin } = require('../../service/replenishment/replenishmentUSDT');
const sleep = require('../../helpers/sleepFunction');


const CronJob = require('cron').CronJob;

const checkUserUsdtTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    
      for (let i = 0; i < wallets.length; i++) {
        sleep(15000).then(async () => await ReplenishmentUserWalletUSDT(wallets[i].id));
      }
  } catch (error) {
    console.error(error)
  }
});

const chechAdminUsdtTransaction = new CronJob('0 */2 * * * *', async () => {
  try {
    const allTransactions = await TransactionUsdtStatus.find({})
    for (let i = 0; i < allTransactions.length; i++) {
      // await sleep(1200).then(async () => await CheckUsdtTransactionAmin(allTransactions[i]));
      sleep(10000).then(async () => await CheckUsdtTransactionAmin(allTransactions[i]));
    };
  } catch (error) {
    console.error(error)
  }
})

module.exports = {
  checkUserUsdtTransaction,
  chechAdminUsdtTransaction
};