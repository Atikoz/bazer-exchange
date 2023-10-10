const axios = require('axios');
const TeleBot = require('telebot');
const { 
  decimalMnemonics, 
  decimalWallet 
} = require('../decimalConfig.js');
const UserManagement = require('./userManagement.js');
const HashReplenishment = require('../model/modelHashReplenishment.js');
const {
  SendCoin, 
  TransferCommission
} = require('../function/decimal.js');
const TransactionStatus = require('../model/modelTransactionStatus.js');
const BalanceUserModel = require('../model/modelBalance.js');
const { token } = require('../config.js');

const bot = new TeleBot(token);

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
  ddao: 5
};

class Replenishment {
  async ReplenishmentUserWallet(userId) {
    try {
      const getInfoUser = await UserManagement.getInfoUser(userId);
      const getUserTransaction = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/address/${getInfoUser.userWallet.del.address}/txs?limit=10&offset=0`);

      for (let i = 0; i <= getUserTransaction.data.result.txs.length - 1; i++) {

        if (getUserTransaction.data.result.txs.length === 0) return;
        const examinationIf = !await HashReplenishment.findOne({id: getUserTransaction.data.result.txs[i].hash}) &&
        getUserTransaction.data.result.txs[i].status === 'Success' &&
        getUserTransaction.data.result.txs[i].to === getInfoUser.userWallet.del.address &&
        getUserTransaction.data.result.txs[i].data.amount/1e18 >= minimalWithdrawal[getUserTransaction.data.result.txs[i].data.coin];

        if (examinationIf) {
          await HashReplenishment.create({
            id: getUserTransaction.data.result.txs[i].hash, 
            coin: getUserTransaction.data.result.txs[i].data.coin 
          });
          console.log('model user send created');

          const amount = ((await TransferCommission(
            getInfoUser.userWallet.mnemonics, 
            decimalWallet, 
            getUserTransaction.data.result.txs[i].data.coin, 
            getUserTransaction.data.result.txs[i].data.amount/1e18
          )).data.result.result.amount/1e18)+0.5;
          
          console.log(amount);
          console.log('commissiuion calculated');

          const moneyTransfer = await SendCoin(
            getInfoUser.userWallet.mnemonics, 
            decimalWallet,
            getUserTransaction.data.result.txs[i].data.coin,
            getUserTransaction.data.result.txs[i].data.amount/1e18-amount
          );

          console.log(getUserTransaction.data.result.txs[i].data.coin)
          console.log('-------------')
          console.log(getUserTransaction.data.result.txs[i].data.amount/1e18-amount)
          console.log('Coins send admin wallet')
          console.log(moneyTransfer.data.result.result.tx_response.code)

          if (moneyTransfer.data.result.result.tx_response.code != 0) return;

          await TransactionStatus.create({
            id: userId,
            hash: moneyTransfer.data.result.result.tx_response.txhash, 
            status: 'UserSend',
            amount: getUserTransaction.data.result.txs[i].data.amount/1e18, 
            processed: false
          });
          console.log('Document TransactionStatus created');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async CheckBalanceAdmin(hash, userId, amount) {
    try {
      const infoTransaction = await axios.get(`https://mainnet-explorer-api.decimalchain.com/api/tx/${hash}`)
      if (infoTransaction.data.result.status === "Success") {
        await BalanceUserModel.updateOne(
          {id: userId}, 
          JSON.parse(`{"$inc": { "main.${infoTransaction.data.result.data.coin}": ${amount} } }`)
          );

        await TransactionStatus.updateOne(
          {hash: hash},
          {$set: {status: "Done", processed: true}}
          );

        await bot.sendMessage(userId, `Ваш баланс пополнено на ${amount} ${infoTransaction.data.result.data.coin}!`);
      }
    } catch (err) {
      console.log(err);
    }
  }
}


module.exports = new Replenishment;
