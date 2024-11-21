const WalletUserModel = require('../../model/user/modelWallet.js');
const { checkBalanceArtery, checkAdminWallet } = require('../../function/arteryTransaction.js');
const ArteryReplenishment = require('../../model/modelArterySendAdmin.js');

const CronJob = require('cron').CronJob;


const checkArtrBalance = new CronJob('0 */1 * * * *', async () => {
  try {
    const wallets = await WalletUserModel.find({});
    wallets.map(async (w) => { await checkBalanceArtery(w.id, w.mnemonic, w.artery.address) });
  } catch (error) {
    console.error(error)
  }
});

const checkArtrAdminHash = new CronJob('0 */1 * * * *', async () => {
  try {
    const allTransactions = await ArteryReplenishment.find({});
    for (let i = 0; i < allTransactions.length; i++) {
      await checkAdminWallet(allTransactions[i]);
    }
  } catch (error) {
    console.error(error)
  }
});

module.exports = {
  checkArtrBalance,
  checkArtrAdminHash
};