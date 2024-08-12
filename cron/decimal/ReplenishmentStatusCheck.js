const TransactionStatus = require('../../model/modelTransactionStatus.js');
const WalletUserModel = require('../../model/modelWallet.js');
const ReplenishmentDecimal = require('../../service/replenishment/replenishmentDecimal.js');

const CronJob = require('cron').CronJob;

const checkUserTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    wallets.map(async (w) => {
      await ReplenishmentDecimal.ReplenishmentUserWallet(w.id)
    });
    const status = await TransactionStatus.find({});
    status.map(async (t) => {
      if (t.status === 'Done' && t.processed) return;
      await ReplenishmentDecimal.CheckBalanceAdmin(t.hash, t.id, t.amount)
  });
  } catch (error) {
    console.error('decimal check error:', error)
  }
});

module.exports = checkUserTransaction;




