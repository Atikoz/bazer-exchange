const WalletUserModel = require('../model/modelWallet');
const { checkUserTransaction, balanceCheckAdminWallet } = require('../service/replenishmentMinter');


const CronJob = require('cron').CronJob;

const checkMinterTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    wallets.forEach(async (w) => { await checkUserTransaction(w.id) });

    await balanceCheckAdminWallet();
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkMinterTransaction;