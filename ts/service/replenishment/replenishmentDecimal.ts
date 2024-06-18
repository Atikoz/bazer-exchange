import axios from 'axios';
import config from '../../config'
import getInfoUser from '../../service/getInfoUser';
import sleep from '../../helpers/sleepFunction';
import BalanceUserModel from '../../model/modelBalance.js';
import functionDecimal from '../../function/decimalFunction.js';
import sendMessage from '../../helpers/sendMessage.ts';
import sendLogs from '../../helpers/sendLog.ts';
import HashReplenishment from '../../model/decimal/modelHashReplenishment.ts';
import TransactionStatus from '../../model/decimal/modelTransactionStatus.ts';


const minimalWithdrawal: object = {
  del: 20,
  dar: 25,
  pro: 100,
  sbt: 100,
  reboot: 5,
  makarovsky: 1,
  btt: 300,
  dixwell: 10,
  avt: 5,
  kharat: 200,
  byacademy: 1,
  patrick: 30,
  itcoin: 50,
  messege: 500,
  rrunion: 150,
  vegvisir: 10,
  fbworld: 15,
  dcschool: 15,
  comcoin: 100,
  mintcandy: 4000000,
  sirius: 35,
  cgttoken: 15,
  genesis: 5,
  taxicoin: 30,
  prosmm: 1,
  sharafi: 1,
  safecoin: 1,
  dtradecoin: 1,
  izicoin: 1,
  gzacademy: 10,
  workout: 5000,
  zaruba: 10,
  magnetar: 100,
  candypop: 1,
  randomx: 60,
  ekology: 150,
  emelyanov: 50,
  belymag: 10,
  doorhan: 1,
  lakshmi: 10,
  ryabinin: 200,
  related: 100,
  monopoly: 5000,
  baroncoin: 1000,
  nashidela: 15,
  irmacoin: 50,
  maritime: 1,
  business: 10,
  randice: 10,
  alleluia: 600,
  hosanna: 600,
  cbgrewards: 1,
  novoselka: 100,
  monkeyclub: 20,
  grandpay: 5,
  magnate: 100,
  crypton: 200000,
  iloveyou: 200,
  bazercoin: 20,
  bazerusd: 20000,
  ddao: 5,
  cashback: 50,
  delkakaxa: 15,
  converter: 500
};

class ReplenishmentDecimal {
  public async ReplenishmentUserWallet(userId: number): Promise<void> {
    try {
      const infoUser = await getInfoUser(userId);
      const userWallet = infoUser.userWallet.del.address;
      const answer = await sleep(5000).then(async () => await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/address/${userWallet}/txs?limit=10&offset=0`));
      const userTransaction = answer.data.result.txs;

      await Promise.all(userTransaction.map(async (tx) => {
        if (tx.status === 'Success' &&
          tx.to === userWallet &&
          tx.data.amount / 1e18 >= minimalWithdrawal[tx.data.coin]
        ) {
          
          const examinationIf = !await HashReplenishment.findOne({ id: tx.hash });

          if (examinationIf) {
            const comission = await sleep(5000).then(async () => await functionDecimal.TransferCommissionDecimal(
              infoUser.userWallet.mnemonics,
              config.adminDecimalWallet,
              tx.data.coin,
              (tx.data.amount / 1e18) - 63
            ));

            if (!comission) {
              throw new Error("Transfer comission calculation error");
            }

            console.log('Calculated comission:', comission);

            const moneyTransfer = await sleep(5000).then(async () => await functionDecimal.SendCoinDecimal(
              infoUser.userWallet.mnemonics,
              config.adminDecimalWallet,
              tx.data.coin,
              tx.data.amount / 1e18 - comission
            ));

            if (!moneyTransfer) {
              throw new Error("Send coin decimal error");
            }

            const resultTransfer = moneyTransfer.result;

            console.log(tx.data.coin);
            console.log('-------------');
            console.log(tx.data.amount / 1e18 - comission);
            console.log('Coins send admin wallet');
            console.log(moneyTransfer.result);
            console.log(!!resultTransfer);

            if (!resultTransfer) return;

            await HashReplenishment.create({ id: tx.hash, coin: tx.data.coin });
            console.log('model user send created');

            await TransactionStatus.create({
              id: userId,
              hash: moneyTransfer.result.tx_response.txhash,
              status: 'UserSend',
              amount: tx.data.amount / 1e18,
              processed: false,
            });
            console.log('Document TransactionStatus created');
          }
        }
      }));
    } catch (error) {
      console.error(error);
    }
  }

  public async CheckBalanceAdmin(hash: string, userId: number, amount: number): Promise<void> {
    try {
      const infoTransaction = await sleep(5000).then(async () => await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/tx/${hash}`));
      if (infoTransaction.data.result.status === 'Success') {
        const replenishmentCoin = infoTransaction.data.result.data.coin;
        await BalanceUserModel.updateOne(
          { id: userId },
          { $inc: { [`main.${replenishmentCoin}`]: amount } }
        );

        await TransactionStatus.updateOne(
          { hash: hash },
          { $set: { status: 'Done', processed: true } }
        );

        sendMessage(userId, `Ваш баланс пополнено на ${amount} ${replenishmentCoin}!`);
        await sendLogs(`Пользователь ${userId} пополнил баланс на ${amount} ${replenishmentCoin}`)
      }
    } catch (err) {
      console.log(err);
    }
  }
}

export default new ReplenishmentDecimal;