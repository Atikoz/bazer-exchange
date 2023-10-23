const TransactionMpxXfiStatus = require('../model/modelMpxXfiStatusTransactions');
const WalletUserModel = require('../model/modelWallet');
const { ReplenishmentUserWallet, CheckMinePlexTransactionAmin } = require('../service/replenishmentMpxXfi');


const CronJob = require('cron').CronJob;

const checkUserMpxXfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    wallets.map(async (w) => { await ReplenishmentUserWallet(w.id); });
  } catch (error) {
    console.error(error)
  }
});

const checkAdminMpxXfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const allTransactions = await TransactionMpxXfiStatus.find({})
    for (let i = 0; i < allTransactions.length; i++) {
      await CheckMinePlexTransactionAmin(allTransactions[i]);
    };
  } catch (error) {
    console.error(error)
  }
});

module.exports = {
  checkUserMpxXfiTransaction,
  checkAdminMpxXfiTransaction
};