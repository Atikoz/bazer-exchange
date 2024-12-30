const config = require("../../config");
const CrossfiSendAdmin = require("../../model/crossfi/CrossfiSendAdmin");
const CrossfiUserReplenishment = require("../../model/crossfi/CrossfiUserReplenishment");
const userManagement = require("../userManagement");
const crossfiService = require("./crossfiService");
const sleep = require("../../helpers/sleepFunction");
const { ControlUserBalance } = require("../../helpers/userControl");
const { sendMessage } = require("../../helpers/tgFunction");
const sendLogs = require("../../helpers/sendLog");
const encryptionService = require("../../function/encryptionService");


class ReplenishmentCrossfi extends crossfiService {
  async CheckUserWallet(userId) {
    try {
      const getInfoUser = await userManagement.getInfoUser(userId);
      const userWallet = getInfoUser.userWallet.crossfi.address;
      const encryptedUserMnemonic = getInfoUser.userWallet.mnemonic;
      const userMnemonic = encryptionService.decryptSeed(encryptedUserMnemonic);
      const transactions = await this.getUserTx(userWallet);

      if (!transactions.length) return

      for (const tx of transactions) {
        if (tx.code) {
          continue
        }

        const txData = this.getTxData(tx.rawLog);
        const validateTx = await this.validateTx(userWallet, tx.hash, txData.sender, txData.amount, txData.coin);

        if (validateTx) {
          const feeTx = await this.calculateFeeTx(
            config.adminWalletCrossfi,
            userMnemonic,
            txData.coin,
            txData.amount / 1e18
          );

          const amountSendAdminWallet = (+txData.amount / 1e18) - feeTx;

          await sleep(5000)

          const sendCoinAdmin = await this.sendCoin(
            config.adminWalletCrossfi,
            userMnemonic,
            txData.coin,
            amountSendAdminWallet - 0.001
          );

          if (!sendCoinAdmin.status) {
            throw new Error('error send coin admin wallet')
          }

          await CrossfiUserReplenishment.create({
            id: userId,
            hash: tx.hash,
            coin: txData.coin,
            amount: txData.amount / 1e18
          });

          await CrossfiSendAdmin.create({
            id: userId,
            hash: sendCoinAdmin.tx.transactionHash,
            coin: txData.coin,
            amount: txData.amount / 1e18,
            status: 'Processed',
          });

          console.log('tx register');
        }
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  async CheckAdminWallet(sendAdminTx) {
    const { id, coin, amount, status, hash } = sendAdminTx;

    if (status === 'Done' || status === 'Fail') return

    try {
      const checkTx = await this.checkTxHash(hash)

      if (checkTx?.tx_result.code) {
        await CrossfiSendAdmin.updateOne(
          { hash: sendAdminTx.hash },
          { $set: { status: 'Fail' }}
        );

        throw new Error('fail send coin in block chain');
      }

      await ControlUserBalance(
        id,
        coin,
        amount
      );

      await CrossfiSendAdmin.updateOne(
        { hash: sendAdminTx.hash },
        { $set: { status: 'Done' }}
      );

      await sendMessage(id, `Вас счет пополнено на ${amount} ${coin.toUpperCase()}`);
      await sendLogs(`Пользователь ${id} пополнил баланс на ${amount} ${coin.toUpperCase()}`);

      return
    } catch (error) {
      console.error('CheckAdminWallet', error.message)
    }
  }
}

module.exports = new ReplenishmentCrossfi