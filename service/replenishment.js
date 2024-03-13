const axios = require('axios');
const { decimalWallet } = require('../decimalConfig.js');
const UserManagement = require('./userManagement.js');
const HashReplenishment = require('../model/modelHashReplenishment.js');
const {
  SendCoin,
  TransferCommission
} = require('../function/decimal.js');
const TransactionStatus = require('../model/modelTransactionStatus.js');
const BalanceUserModel = require('../model/modelBalance.js');
const sendLogs = require('../helpers/sendLog.js');
const sendMessage = require('../helpers/tgFunction.js');
const sleep = require('../helpers/sleepFunction.js');


const minimalWithdrawal = {
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
  cashback: 50
};

class Replenishment {
  async ReplenishmentUserWallet(userId) {
    try {
      const getInfoUser = await UserManagement.getInfoUser(userId);
      const userWallet = getInfoUser.userWallet.del.address;
      const answer = await sleep(5000).then(async () => await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/address/${userWallet}/txs?limit=10&offset=0`));
      const userTransaction = answer.data.result.txs;

      await Promise.all(userTransaction.map(async (tx) => {
        if (tx.status === 'Success' &&
          tx.to === userWallet &&
          tx.data.amount / 1e18 >= minimalWithdrawal[tx.data.coin]
        ) {
          
          const examinationIf = !await HashReplenishment.findOne({ id: tx.hash });

          if (examinationIf) {
            const comission = await sleep(5000).then(async () => await TransferCommission(
              getInfoUser.userWallet.mnemonics,
              decimalWallet,
              tx.data.coin,
              (tx.data.amount / 1e18) - 63
            ));

            console.log('Calculated comission:', comission);

            const moneyTransfer = await sleep(5000).then(async () => await SendCoin(
              getInfoUser.userWallet.mnemonics,
              decimalWallet,
              tx.data.coin,
              (tx.data.amount / 1e18 - comission) - 63
            ));

            const codeTransfer = moneyTransfer.data.result.result.tx_response.code;

            console.log(tx.data.coin);
            console.log('-------------');
            console.log(tx.data.amount / 1e18 - comission - 50);
            console.log('Coins send admin wallet');
            console.log(moneyTransfer.data.result.result);
            console.log(codeTransfer);

            if (codeTransfer !== 0) return;

            await HashReplenishment.create({ id: tx.hash, coin: tx.data.coin });
            console.log('model user send created');

            await TransactionStatus.create({
              id: userId,
              hash: moneyTransfer.data.result.result.tx_response.txhash,
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

  async CheckBalanceAdmin(hash, userId, amount) {
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

module.exports = new Replenishment;