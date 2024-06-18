import getInfoUser from "../../service/getInfoUser";
import sleep from "../../helpers/sleepFunction";
import usdtFun from "../../function/usdtFunction";
import UsdtReplenishment from "../../model/usdt/modelUsdtReplenishment";
import config from '../../config.ts';
import TransactionUsdtStatus from "../../model/usdt/modelTransactionUsdtStatus";
import BalanceUserModel from "../../model/modelBalance.ts";
import sendMessage from "../../helpers/sendMessage";
import sendLog from "../../helpers/sendLog";

interface Transaction {
  id: String,
  coin: String,
  hash: String,
  status: String,
  amount: Number
}

class ReplenishmentUSDT {
  async ReplenishmentUserWalletUSDT(userId: number): Promise<void> {
    try {
      const infoUser = await getInfoUser(userId);
      const userUsdtAdress = infoUser.userWallet.usdt.address;
      const userUsdtPrivatKey = infoUser.userWallet.usdt.privateKey;
      const userTransaction = await sleep(10000).then(async () => await usdtFun.getTransaction(userUsdtAdress));

      if (userTransaction.length === 0) return

      for (let i = 0; i < userTransaction.length; i++) {
        const examinationIf = !await UsdtReplenishment.findOne({ hash: userTransaction[i].hash }) && userTransaction[i].coin === 'usdt' && userTransaction[i].amount >= 2 && userTransaction[i].status === 'SUCCESS' && userTransaction[i].sender !== userUsdtAdress;
        if (examinationIf) {
          console.log('transaction processed');
          const balanceTronUser = await sleep(10000).then(async () => await usdtFun.getBalanceTron(userUsdtAdress, userUsdtPrivatKey));

          if (balanceTronUser < 30) {
            await usdtFun.TransferTronwebTrx(config.adminPrivateKeyUsdt, config.adminWalletUsdt, userUsdtAdress, 30 - balanceTronUser);
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

          const hashTransactionAdminWallet = await usdtFun.TransferTronNet(infoUser.userWallet.usdt.privateKey, config.contractUsdt, config.adminWalletUsdt, userTransaction[i].amount);
          await TransactionUsdtStatus.create({
            id: userId,
            coin: userTransaction[i].coin,
            hash: hashTransactionAdminWallet,
            status: 'Send Admin Wallet',
            amount: userTransaction[i].amount,
          });
          console.log('model send Admin wallet create');
        };
      };
    } catch (error) {
      console.error(error.message);
      return
    }
  };

  async CheckUsdtTransactionAmin(replenishment: Transaction): Promise<void> {
    try {
      if (replenishment.status === 'Done' || replenishment.status === 'Fail') return
      const infoTransaction = await sleep(5000).then( async () => await usdtFun.transactionTronNetworkInfo(replenishment.hash + ''));

       if (!infoTransaction) return

       const statusTransaction = infoTransaction.contractRet;

      if (statusTransaction === 'SUCCESS') {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { status: 'Done' }
        );
        await BalanceUserModel.updateOne(
          { id: replenishment.id },
          JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
        );
        sendMessage(+replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
        await sendLog(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}`);
      }
      else if (statusTransaction === "OUT_OF_ENERGY") {
        //изменение статуса проверки траназакции
        await TransactionUsdtStatus.updateOne({ hash: replenishment.hash }, { $set: { status: "Fail" } });
        sendMessage(+replenishment.id, `При пополнении возникла ошибка... Сообщите администрации!\nTxHash: <code>${replenishment.hash}</code>`);
      };

    } catch (error) {
      // console.error(error.message)
      return
    }
  };
};

export default new ReplenishmentUSDT;