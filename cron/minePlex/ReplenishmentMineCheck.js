const HashSendAdminComission = require('../../model/modelHashSendAdminComission');
const TransactionMinePlextStatus = require('../../model/modelMinePlexStatusTransactions');
const WalletUserModel = require('../../model/user/modelWallet.js');
const { ReplenishmentUserWallet, CheckMinePlexTransactionAmin, CheckCommissionTransactionAmin } = require('../../service/replenishment/replenishmentMinePlex');


const CronJob = require('cron').CronJob;

const checkUserMinePlexTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    wallets.map(async (w) => { await ReplenishmentUserWallet(w.id); });
  } catch (error) {
    console.error(error)
  }
});

const chechAdminMinePlexTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const allTransactions = await TransactionMinePlextStatus.find({})
    for (let i = 0; i < allTransactions.length; i++) {
      await CheckMinePlexTransactionAmin(allTransactions[i]);
    };
  } catch (error) {
    console.error(error)
  }
});

const checkHashSendAdminComission = new CronJob('0 */1 * * * *', async () => {
  try {
    const data = await HashSendAdminComission.find();
    data.map(async (t) => {
      await CheckCommissionTransactionAmin(t);
    })
  } catch (error) {
    console.error(error)
  }
});


module.exports = {
  checkHashSendAdminComission,
  checkUserMinePlexTransaction,
  chechAdminMinePlexTransaction
};