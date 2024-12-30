const CrossfiSendAdmin = require('../../model/crossfi/CrossfiSendAdmin.js');
const WalletUserModel = require('../../model/user/modelWallet.js');
const ReplenishmentService = require('../../service/crossfi/ReplenishmentService.js');
const CronJob = require('cron').CronJob;


const checkUserCrossfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});

    wallets.map(async (w) => {
      await ReplenishmentService.CheckUserWallet(w.id);
    });
  } catch (error) {
    console.error(error)
  }
});

const checkAdminCrossfiTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const allTransactions = await CrossfiSendAdmin.find();

    for (const tx of allTransactions) {
      await ReplenishmentService.CheckAdminWallet(tx);
    };
  } catch (error) {
    console.error(error)
  }
});

module.exports = {
  checkUserCrossfiTransaction,
  checkAdminCrossfiTransaction
};