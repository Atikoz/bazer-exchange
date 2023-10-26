const TeleBot = require('telebot');
const config = require('../config.js');
const UserManagement = require('./userManagement.js');
const BalanceUserModel = require('../model/modelBalance.js');
const { getMpxXfiTransactions, CheckBalance, SendCoin, CheckTransactionHash } = require('../function/mpxXfiTransactions.js');
const MpxXfiReplenishment = require('../model/modelMpxXfiReplenishment.js');
const HashSendAdminComission = require('../model/modelHashSendAdminComission.js');
const TransactionMpxXfiStatus = require('../model/modelMpxXfiStatusTransactions.js');

const bot = new TeleBot(config.token);

const minimalReplenishment = {
  mpx: 5,
  xfi: 5
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

        const examinationIf = 
          (!await MpxXfiReplenishment.findOne({hash: userTransaction[i].txhash})) &&
          !(userTransaction[i].tx.body.messages[0].from_address === userWallet) &&
          !(userTransaction[i].tx.body.messages[0].to_address === config.adminWalletMpxXfi) &&
          ((userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18) >= minimalReplenishment[coin]) &&
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

          const balanceMpx = await CheckBalance(userWallet);
          const amount = userTransaction[i].tx.body.messages[0].amount[0].amount / 1e18;
          console.log('BLANCE MPX:', balanceMpx);

          if (coin === 'xfi' && balanceMpx < 1) {
            const hashTransferComission = await SendCoin(config.adminMnemonicMinePlex, userWallet, 'mpx', 1);

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

  // async CheckCommissionTransactionAmin(transaction) {
  //   try {
  //     if (transaction.status === 'Done') return

  //     console.log(transaction);

  //     const getInfoUser = await UserManagement.getInfoUser(transaction.id);
  //     const userMnemonic = getInfoUser.userWallet.mnemonics;

  //     const chechTransaction = await CheckTransactionHash(hash);

  //     if (chechTransaction) {
  //       await HashSendAdminComission.updateOne(
  //         {hash: transaction.hash},
  //         {status: 'Done'}
  //       );

  //       const hashTransactionAdminWallet = await SendCoin(userMnemonic, config.adminWalletMpxXfi, transaction.coin, transaction.amount);

  //       await TransactionMpxXfiStatus.create({
  //         id: transaction.id,
  //         coin: transaction.coin,
  //         hash: hashTransactionAdminWallet,
  //         status: 'Send-Admin-Wallet',
  //         amount: transaction.hash,
  //         processed: false,
  //       });
  //     };
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  async CheckMinePlexTransactionAmin(replenishment) {
    try {

      if (replenishment.status === 'Done' && replenishment.processed) return

      const adminTransaction = await getMpxXfiTransactions(config.adminWalletMpxXfi);

      if (adminTransaction.length === 0) return

      for (let i = 0; i < adminTransaction.length; i++) {

        if (adminTransaction[i].txhash === replenishment.hash) {

          await TransactionMpxXfiStatus.updateOne(
            {hash: replenishment.hash},
            {status: 'Done', processed: true}
          );

          await BalanceUserModel.updateOne(
            {id: replenishment.id},
            JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
          );

          await bot.sendMessage(replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`)
        }
      };
    } catch (error) {
      console.error(error)
    }
  }
};

module.exports = new ReplenishmentMpxXfi;