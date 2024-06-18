import MpxXfiReplenishment from "../../model/mpxXfi/modelMpxXfiReplenishment";
import mpxXfi from "../../function/mpxXfiFunction";
import getInfoUser from "../getInfoUser";
import config from "../../config";
import HashSendAdminComission from "../../model/mpxXfi/modelHashSendAdminComission";
import sleep from "../../helpers/sleepFunction";
import TransactionMpxXfiStatus from "../../model/mpxXfi/modelMpxXfiStatusTransactions";
import sendMessage from "../../helpers/sendMessage";
import sendLogs from "../../helpers/sendLog";
import BalanceUserModel from "../../model/modelBalance";


const minimalReplenishment: { [key: string]: number } = {
  mpx: 2,
  xfi: 2
};

interface ReplenishmentTransaction {
  id: String,
  coin: String,
  hash: String,
  status: String,
  amount: Number
}

class ReplenishmentMpxXfi {
  public async ReplenishmentUserWallet(userId: number): Promise<void> {
    try {
      const infoUser = await getInfoUser(userId);
      const userWallet = infoUser.userWallet.mpxXfi.address;
      const userMnemonic = infoUser.userWallet.mnemonics;
      const userTransaction = await mpxXfi.getTransactions(userWallet);

      if (userTransaction.length === 0) return

      for (let i = 0; i < userTransaction.length; i++) {

        const coin = userTransaction[i].tx.body.messages[0].amount[0].denom;

        const examinationIf =
          (!await MpxXfiReplenishment.findOne({ hash: userTransaction[i].txhash })) &&
          !(userTransaction[i].tx.body.messages[0].from_address === userWallet) &&
          !(userTransaction[i].tx.body.messages[0].to_address === config.adminWalletMpxXfi) &&
          ((+userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18) >= minimalReplenishment[coin]) &&
          (coin === 'mpx' || coin === 'xfi');

        if (examinationIf) {
          console.log('transaction processed');
          await MpxXfiReplenishment.create({
            id: userId,
            coin: coin,
            hash: userTransaction[i].txhash,
            amount: +userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18
          });
          console.log('model user send created');

          const balanceMpx = await sleep(5000).then(async () => await mpxXfi.checkBalance(userWallet));
          const amount = +userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18;
          console.log('BLANCE MPX:', balanceMpx);

          if (coin === 'xfi' && balanceMpx < 1) {
            const hashTransferComission = await sleep(5000).then(async () => await mpxXfi.sendCoin(config.adminMnemonicMinePlex, userWallet, 'mpx', 1));

            await HashSendAdminComission.create({
              id: userId,
              hash: hashTransferComission,
              status: 'comission-send-user-wallet',
              amount: amount,
              coin: coin
            });

            console.log('mpx send user wallet');
            return
          } else {
            console.log('mpx hvataet');
          }

          let hashTransactionAdminWallet: string | void;

          if (coin === 'mpx') {
            hashTransactionAdminWallet = await sleep(5000).then(async () => await mpxXfi.sendCoin(userMnemonic, config.adminWalletMpxXfi, coin, amount - 1));
            console.log('mpx send admin wallet');
          } else {
            hashTransactionAdminWallet = await sleep(5000).then(async () => await mpxXfi.sendCoin(userMnemonic, config.adminWalletMpxXfi, coin, amount));
            console.log('xfi send admin wallet');
          }

          await TransactionMpxXfiStatus.create({
            id: userId,
            coin: coin,
            hash: hashTransactionAdminWallet,
            status: 'SendAdminWallet',
            amount: amount,
          });

          console.log('model send admin wallet created');
        }
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  public async CheckMinePlexTransactionAmin(replenishment: ReplenishmentTransaction): Promise<void> {
    try {
      if (replenishment.status === 'Done') return

      const adminTransaction = await sleep(5000).then(async () => mpxXfi.getTransactions(config.adminWalletMpxXfi));

      if (adminTransaction.length === 0) return

      for (let i = 0; i < adminTransaction.length; i++) {

        if (adminTransaction[i].txhash === replenishment.hash) {

          await TransactionMpxXfiStatus.updateOne(
            { hash: replenishment.hash },
            { status: 'Done' }
          );

          await BalanceUserModel.updateOne(
            { id: replenishment.id },
            JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
          );

          sendMessage(+replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
          await sendLogs(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}`)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}
export default new ReplenishmentMpxXfi;