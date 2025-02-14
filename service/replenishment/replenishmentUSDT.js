// const axios = require('axios');
const config = require('../../config.js');
const UserManagement = require('../userManagement.js');
const { getTransaction, TransferTronNet, TransferTronwebTrx, getBalanceTron, transactionTronNetworkInfo } = require('../../function/usdtTransactions.js');
const UsdtReplenishment = require('../../model/modelUsdtReplenishment.js');
const TransactionUsdtStatus = require('../../model/modelTransactionsUsdtStatus.js');
const BalanceUserModel = require('../../model/user/modelBalance.js');
const sendLog = require('../../helpers/sendLog.js');
const { sendMessage } = require('../../helpers/tgFunction.js');
const sleep = require('../../helpers/sleepFunction.js');

class ReplenishmentUSDT {
  async ReplenishmentUserWalletUSDT(userId) {
    try {
      const getInfoUser = await UserManagement.getInfoUser(userId);
      const userUsdtAdress = getInfoUser.userWallet.usdt.address;
      const userUsdtPrivatKey = getInfoUser.userWallet.usdt.privateKey;
      const userTransaction = await getTransaction(userUsdtAdress);

      if (userTransaction.length === 0) return;

      for (let i = 0; i < userTransaction.length; i++) {
        const examinationIf =
          !await UsdtReplenishment.findOne({ hash: userTransaction[i].hash }) &&
          userTransaction[i].coin === 'usdt' &&
          userTransaction[i].amount >= 2 &&
          userTransaction[i].status === 'SUCCESS' &&
          userTransaction[i].sender !== userUsdtAdress;

        if (examinationIf) {
          console.log('transaction processed');
          await sleep(5000)
          const balanceTronUser = await getBalanceTron(userUsdtAdress, userUsdtPrivatKey);

          if (balanceTronUser < 30) {
            await TransferTronwebTrx(config.privatKeyUsdt, config.adminWalletUsdt, userUsdtAdress, 30 - balanceTronUser);
            console.log('tron send user wallet');

            return
          };

          await UsdtReplenishment.create({
            id: userId,
            coin: userTransaction[i].coin,
            hash: userTransaction[i].hash,
            amount: userTransaction[i].amount
          });

          console.log('model user send created');

          const hashTransactionAdminWallet = await TransferTronNet(getInfoUser.userWallet.usdt.privateKey, config.contractUsdt, config.adminWalletUsdt, userTransaction[i].amount);
          
          await TransactionUsdtStatus.create({
            id: userId,
            coin: userTransaction[i].coin,
            hash: hashTransactionAdminWallet,
            status: 'Send Admin Wallet',
            amount: userTransaction[i].amount,
            processed: false
          });
          console.log('model send Admin wallet create');
        };
      };
    } catch (error) {
      // console.error(error.message)
      return
    }
  };

  async CheckUsdtTransactionAmin(replenishment) {
    if (replenishment.status === 'Done' || replenishment.status === 'Fail') {
      return
    }

    try {
      await sleep(5000);
      const checkHash = (await transactionTronNetworkInfo(replenishment.hash)).contractRet;

      if (checkHash === 'SUCCESS') {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { status: 'Done', processed: true }
        );

        await BalanceUserModel.updateOne(
          { id: replenishment.id },
          JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
        );

        sendMessage(replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
        await sendLog(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}`);
      }

      else if (checkHash === "OUT_OF_ENERGY") {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { $set: { processed: true, status: "Fail" } }
        );

        sendMessage(replenishment.id, `При пополнении возникла ошибка... Сообщите администрации!`);
      };

    } catch (error) {
      // console.error(error.message)
      return
    }
  };
};

module.exports = new ReplenishmentUSDT;
