import sleep from "../../../function/sleepFunction";
import { ReplenishmentTrc20 } from "../../../interface/Trc20Interfces";
import TransactionUsdtStatus from "../../../models/trc20/modelTransactionsUsdtStatus";
import UsdtReplenishment from "../../../models/trc20/modelUsdtReplenishment";
import BalanceUser from "../../../models/user/BalanceModel";
import BotService from "../../telegram/BotService";
import UserManagement from "../../user/UserManagement";
import Trc20Service from "./Trc20Service";


class ReplenishmentTrc20Service extends Trc20Service {
  async ReplenishmentTrc20(userId: string): Promise<void> {
    try {
      const { userWallet } = await UserManagement.getInfoUser(userId);
      const userUsdtAdress = userWallet.usdt.address;
      const userUsdtPrivatKey = userWallet.usdt.privateKey;
      const userTransaction = await this.getTransaction(userUsdtAdress);

      for (const tx of userTransaction) {
        const alreadyExists = await UsdtReplenishment.findOne({ hash: tx.hash });

        const isValidTx = !alreadyExists &&
          tx.coin === 'usdt' &&
          tx.amount >= 2 &&
          tx.status === 'SUCCESS' &&
          tx.sender !== userUsdtAdress;

        if (isValidTx) {
          console.log('transaction processed');

          const isActive = await this.ensureAccountActivated(userUsdtAdress);

          if (!isActive) {
            console.log(`${userWallet} is not active`)
            continue
          }

          await this.buyEnergy(userUsdtAdress);
          await sleep(15000);
          const sendCoins = await this.transferCoins(userUsdtPrivatKey, this.contractTypeUsdt, this.adminWalletUsdt, tx.amount);

          if (!sendCoins) {
            console.log('error sending money')
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
      console.error(`error finding tx trc20: `, error)
      return
    }
  };

  async CheckUsdtTransactionAmin(replenishment: ReplenishmentTrc20): Promise<void> {
    if (['Done', 'Fail'].includes(replenishment.status)) {
      return
    }

    try {
      await sleep(5000);
      const { status } = await this.checkTx(replenishment.hash);

      if (status === 'SUCCESS') {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { $set: { status: 'Done' } }
        );

        await BalanceUser.updateOne(
          { id: replenishment.id },
          JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
        );

        BotService.sendMessage(replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
        await BotService.sendLog(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}`);
      }
      else if (status === "OUT_OF_ENERGY") {
        await TransactionUsdtStatus.updateOne(
          { hash: replenishment.hash },
          { $set: { status: "Fail" } }
        );

        BotService.sendMessage(replenishment.id, `При пополнении возникла ошибка... Сообщите администрации!`);
      };

    } catch (error) {
      console.error(`error checking admin tx trc20: `, error)
      return
    }
  };
}

export default new ReplenishmentTrc20Service