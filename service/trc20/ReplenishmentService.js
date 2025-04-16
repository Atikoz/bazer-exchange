const sleep = require("../../helpers/sleepFunction");
const userManagement = require("../userManagement");
const Trc20Service = require("./Trc20Service");
const { contractUsdt, adminWalletUsdt, privatKeyUsdt } = require("../../config");
const UsdtReplenishment = require("../../model/modelUsdtReplenishment");
const TransactionUsdtStatus = require("../../model/modelTransactionsUsdtStatus");
const BalanceUserModel = require("../../model/user/modelBalance");
const { sendMessage } = require("../../helpers/tgFunction");
const sendLogs = require("../../helpers/sendLog");


class ReplenishmentTrc20Service extends Trc20Service {
  constructor() {
    super();
  }

  async ReplenishmentTrc20(userId) {
    try {
      const { userWallet } = await userManagement.getInfoUser(userId);
      const userUsdtAdress = userWallet.usdt.address;
      const userUsdtPrivatKey = userWallet.usdt.privateKey;
      const userTransaction = await this.getTransaction(userUsdtAdress);

      if (userTransaction.length === 0) {
        return
      }

      for (const tx of userTransaction) {
        const examinationIf =
          !await UsdtReplenishment.findOne({ hash: tx.hash }) &&
          tx.coin === 'usdt' &&
          tx.amount >= 2 &&
          tx.status === 'SUCCESS' &&
          tx.sender !== userUsdtAdress;

        if (examinationIf) {
          console.log('transaction processed');

          const isActive = await this.ensureAccountActivated(userUsdtAdress);

          if (!isActive) {
            continue
          }

          await this.buyEnergy(userUsdtAdress);
          await sleep(15000);
          const sendCoins = await this.transferCoins(userUsdtPrivatKey, contractUsdt, adminWalletUsdt, tx.amount);

          if (!sendCoins) {
            continue
          }

          await UsdtReplenishment.create({
            id: userId,
            coin: tx.coin,
            hash: tx.hash,
            amount: tx.amount
          });

          await TransactionUsdtStatus.create({
            id: userId,
            coin: tx.coin,
            hash: sendCoins,
            status: 'Send Admin Wallet',
            amount: tx.amount,
          });
          console.log('model send Admin wallet create');
        };
      }
    } catch (error) {
      console.error(`error finding tx trc20: ${error.message}`)
      return
    }
  };

  async CheckUsdtTransactionAmin(replenishment) {
    if (replenishment.status === 'Done' || replenishment.status === 'Fail') {
      return
    }

    try {
      await sleep(5000);
      const { contractRet } = await this.checkTx(replenishment.hash);

      if (contractRet === 'SUCCESS') {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { $set: { status: 'Done' } }
        );

        await BalanceUserModel.updateOne(
          { id: replenishment.id },
          JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
        );

        sendMessage(replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
        await sendLogs(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}`);
      }

      else if (contractRet === "OUT_OF_ENERGY") {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { $set: { status: "Fail" } }
        );

        sendMessage(replenishment.id, `При пополнении возникла ошибка... Сообщите администрации!`);
      };

    } catch (error) {
      console.error(`error checking admin tx trc20: ${error.message}`)
      return
    }
  };
}

module.exports = new ReplenishmentTrc20Service