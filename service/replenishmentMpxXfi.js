const TeleBot = require('telebot');
const config = require('../config.js');
const UserManagement = require('./userManagement.js');
const BalanceUserModel = require('../model/modelBalance.js');
const { getMpxXfiTransactions, CheckBalance, SendCoin } = require('../function/MpxXfiTransactions.js');
const MpxXfiReplenishment = require('../model/modelMpxXfiReplenishment.js');
const HashSendAdminComission = require('../model/modelHashSendAdminComission.js');
const TransactionMpxXfiStatus = require('../model/modelMpxXfiStatusTransactions.js');



const bot = new TeleBot(config.token);

const minimalReplenishment = {
  mpx: 2,
  xfi: 1
};

class ReplenishmentMpxXfi {
  async ReplenishmentUserWallet(userId) {
    try {
      const getInfoUser = await UserManagement.getInfoUser(userId);
      const userWallet = getInfoUser.userWallet.mpxXfi.address;
      const userMnemonic = getInfoUser.userWallet.mnemonics;
      const userTransaction = await getMpxXfiTransactions(userWallet);

      if (userTransaction.length === 0) return

      for (let i = 0; i < userTransaction.length; i++) {

        const coin = userTransaction[i].tx.body.messages[0].amount[0].denom;
        console.log('coin:', coin);
        const examinationIf = 
          (!await MpxXfiReplenishment.findOne({hash: userTransaction[i].txhash})) &&
          !(userTransaction[i].tx.body.messages[0].from_address === userWallet) &&
          (coin === 'mpx' || coin === 'xfi');

        if (examinationIf) {
          console.log('transaction processed');
          await MpxXfiReplenishment.create({
          id: userId,
          coin: coin,
          hash: userTransaction[i].txhash,
          amount: userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18
          });
          console.log('model user send created');

          const balanceMpx = (await CheckBalance(userWallet))[0].amount;
          const amount = userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18;
          console.log('BLANCE MPX:', balanceMpx);

          if (coin === 'xfi' && balanceMpx < 1) {
            const hashTransferComission = await SendCoin(config.adminMnemonicMinePlex, userWallet, coin, amount);

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

          let hashTransactionAdminWallet;

          if (coin === 'mpx') {
            hashTransactionAdminWallet = await SendCoin(userMnemonic, config.adminWalletMpxXfi, coin, amount - 1);
            console.log('mpx send admin wallet');
          } else {
            hashTransactionAdminWallet = await SendCoin(userMnemonic, config.adminWalletMpxXfi, coin, amount);
            console.log('xfi send admin wallet');
          }

          await TransactionMpxXfiStatus.create({
          id: userId,
          coin: coin,
          hash: hashTransactionAdminWallet,
          status: 'SendAdminWallet',
          amount: amount,
          processed: false
          });

          console.log('model send admin wallet created');
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  


}