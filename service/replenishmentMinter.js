const UserManagement = require('./userManagement.js');
const { getTransaction, getCommissionTx, checkMinterHash, sendBip } = require('../function/minterTransaction.js');
const MinterReplenishment = require('../model/modelMinterReplenishment.js');
const config = require('../config.js');
const TransactionMinterStatus = require('../model/modelMinterStatusTransaction.js');
const BalanceUserModel = require('../model/modelBalance.js');
const sendLogs = require('../helpers/sendLog.js');
const sendMessage = require('../helpers/tgFunction.js');
const sleep = require('../helpers/sleepFunction.js');


class ReplenishmentMinter {
  checkUserTransaction = async (id) => {
    try {
      const getInfoUser = await UserManagement.getInfoUser(id);
      const userAddress = getInfoUser.userWallet.minter.address;
      const userSeed = getInfoUser.userWallet.mnemonics;

      const userTransactionArr = await sleep(5000).then(async () =>  await getTransaction(userAddress));

      userTransactionArr.forEach(async transaction => {

        const requirements =
          !(await MinterReplenishment.findOne({ id: id, hash: transaction.hash })) &&
          transaction.data.to === userAddress &&
          +transaction.data.value >= 100;

        if (requirements) {
          console.log('found trancsaction');

          const commissionTransfer = await sleep(5000).then(async () => await getCommissionTx(config.adminMinterWallet, transaction.data.value));
          console.log('commission tx: ', commissionTransfer);

          const amountTransferAdminWallet = transaction.data.value - commissionTransfer;
          console.log('amountTransferAdminWallet: ', amountTransferAdminWallet);

          const sendBipAdminWallet = await sleep(5000).then(async () => await sendBip(config.adminMinterWallet, amountTransferAdminWallet, userSeed));

          if (!sendBipAdminWallet.status) return console.log('transfer error: ', sendBipAdminWallet.error);
          console.log('coins send amin wallet');


          await MinterReplenishment.create({
            id: id,
            hash: transaction.hash,
            amount: transaction.data.value
          });

          await TransactionMinterStatus.create({
            id: id,
            hash: sendBipAdminWallet.hash,
            status: 'Send Admin',
            amount: transaction.data.value
          })
          console.log('minter hash model created');
        }
      });
    } catch (error) {
      console.error(error)
    }
  };

  balanceCheckAdminWallet = async () => {
    const adminTransactions = (await TransactionMinterStatus.find()).filter(tx => tx.status !== 'Done');;
    if (adminTransactions.length === 0) return
    adminTransactions.forEach(async (transaction) => {
      const resultTx = await sleep(5000).then(async () => await checkMinterHash(transaction.hash));

      if (resultTx.code === "0") {
        await TransactionMinterStatus.updateOne(
          { hash: transaction.hash },
          { status: 'Done' }
        );

        await BalanceUserModel.updateOne(
          { id: transaction.id },
          { $inc: { [`main.bip`]: transaction.amount } }
        );

        sendMessage(transaction.id, `Ваш счет был пополнен на ${transaction.amount} BIP`);
        sendLogs(`Пользователь ${transaction.id} пополнил счет на ${transaction.amount} BIP`);
      } else {
        console.log(resultTx);
        sendMessage(transaction.id, `При пополнении возникла ошибка, обратитесь в техподдержку`);
      }
    })
  }
};

module.exports = new ReplenishmentMinter;