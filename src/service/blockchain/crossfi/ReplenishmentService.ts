import sleep from "../../../function/sleepFunction";
import { CrossfiSendAdminTx } from "../../../interface/CrossfiInterfaces";
import CrossfiSendAdmin from "../../../models/crossfi/CrossfiSendAdmin";
import CrossfiUserReplenishment from "../../../models/crossfi/CrossfiUserReplenishment";
import BalanceService from "../../balance/BalanceService";
import EncryptionService from "../../security/EncryptionService";
import BotService from "../../telegram/BotService";
import UserManagement from "../../user/UserManagement";
import CrossfiService from "./crossfiService";


const ADMIN_WALLET_CROSSFI = process.env.ADMIN_WALLET_CROSSFI;

class ReplenishmentCrossfi extends CrossfiService {
  private readonly adminWalletCrossfi = ADMIN_WALLET_CROSSFI;

  async CheckUserWallet(userId: number): Promise<void> {
    try {
      const getInfoUser = await UserManagement.getInfoUser(userId);
      const userWallet = getInfoUser.userWallet.crossfi.address;
      const encryptedUserMnemonic = getInfoUser.userWallet.mnemonic;
      const userMnemonic = EncryptionService.decryptSeed(encryptedUserMnemonic);
      const transactions = await this.getUserTx(userWallet);

      if (!transactions.length) {
        return
      }

      for (const tx of transactions) {
        if (tx.code) {
          continue
        }

        const txData = this.getTxData(tx.rawLog);
        const validateTx = await this.validateTx(userWallet, tx.hash, txData.sender, +txData.amount, txData.coin);

        if (validateTx) {
          const feeTx = await this.calculateFeeTx(
            this.adminWalletCrossfi,
            userMnemonic,
            txData.coin,
            +txData.amount / 1e18
          );

          let amountSendAdminWallet = (+txData.amount / 1e18) - feeTx;

          if (txData.coin === 'mpx') {
            amountSendAdminWallet -= 0.3
          } else {
            amountSendAdminWallet -= 0.004
          }

          await sleep(5000)

          const sendCoinAdmin = await this.sendCoin(
            this.adminWalletCrossfi,
            userMnemonic,
            txData.coin,
            amountSendAdminWallet
          );

          if (!sendCoinAdmin.status) {
            throw new Error('error send coin admin wallet')
          }

          await CrossfiUserReplenishment.create({
            id: userId,
            hash: tx.hash,
            coin: txData.coin,
            amount: +txData.amount / 1e18
          });

          await CrossfiSendAdmin.create({
            id: userId,
            hash: sendCoinAdmin.tx.transactionHash,
            coin: txData.coin,
            amount: +txData.amount / 1e18,
            status: 'Processed',
          });

          console.log('tx register');
        }
      }
    } catch (error) {
      console.error('crossfi CheckUserWallet error:', error.message)
    }
  }

  async CheckAdminWallet(sendAdminTx: CrossfiSendAdminTx): Promise<void> {
    const { id, coin, amount, hash } = sendAdminTx;

    try {
      const checkTx = await this.checkTxHash(hash)

      if (checkTx?.tx_result.code) {
        await CrossfiSendAdmin.updateOne(
          { hash: sendAdminTx.hash },
          { $set: { status: 'Fail' }}
        );

        throw new Error('fail send coin in block chain');
      }

      await BalanceService.updateBalance(
        id,
        coin,
        amount
      );

      await CrossfiSendAdmin.updateOne(
        { hash: sendAdminTx.hash },
        { $set: { status: 'Done' }}
      );

      await BotService.sendMessage(id, `Вас счет пополнено на ${amount} ${coin.toUpperCase()}`);
      await BotService.sendLog(`Пользователь ${id} пополнил баланс на ${amount} ${coin.toUpperCase()}`);

      return
    } catch (error) {
      console.error('CheckAdminWallet', error.message)
    }
  }
}

export default new ReplenishmentCrossfi