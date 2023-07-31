const TransactionStatus = require('../model/modelTransactionStatus.js');
const WalletUserModel = require('../model/modelWallet.js');
const Replenishment = require('../service/replenishment.js');

const CronJob = require('cron').CronJob;

const checkUserTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    wallets.map(async (w) => {
      await Replenishment.ReplenishmentUserWallet(w.id)
    });
    const status = await TransactionStatus.find({});
    status.map(async (t) => {
      if (t.status === 'Done' && t.processed) return;
      console.log(t.amount, t.hash, t.id);
      await Replenishment.CheckBalanceAdmin(t.hash, t.id, t.amount)
  });
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkUserTransaction;




