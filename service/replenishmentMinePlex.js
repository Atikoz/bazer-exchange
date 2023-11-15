const TeleBot = require('telebot');
const { getMinePlexTransactions, sendCoin, checkBalance, checkHashSendAdminComission } = require('../function/minePlexTransactions.js');
const MinePlexReplenishment = require('../model/modelMinePlexReplenishment.js');
const UserManagement = require('./userManagement.js');
const config = require('../config.js');
const TransactionMinePlextStatus = require('../model/modelMinePlexStatusTransactions.js');
const BalanceUserModel = require('../model/modelBalance.js');
const HashSendAdminComission = require('../model/modelHashSendAdminComission.js');
const TransactionMpxXfiStatus = require('../model/modelMpxXfiStatusTransactions.js');
const { SendCoin, CheckTransactionHash } = require('../function/mpxXfiTransactions.js');

const bot = new TeleBot(config.token);

const minimalReplenishment = {
  mine: 5,
  plex: 5
};

async function sendLogs(text) {
  bot.sendMessage('@p2plogss', `${text}`, { parseMode: 'html' })
};

class ReplenishmentMinePlex {
  async ReplenishmentUserWallet(userId) {
    const getInfoUser = await UserManagement.getInfoUser(userId);
    const userWallet = getInfoUser.userWallet.minePlex.address;
    const userKey = getInfoUser.userWallet.minePlex.sk;
    const userTransaction = await getMinePlexTransactions(userWallet);

    try {
      if (userTransaction.data.length === 0) return

      for (let i = 0; i < userTransaction.data.length; i++) {

        const examinationIf =
          (!await MinePlexReplenishment.findOne({ hash: userTransaction.data[i].operationHash })) &&
          (userTransaction.data[i].destination === userWallet) &&
          !(userTransaction.data[i].source === config.aminWalletMinePlex) &&
          (userTransaction.data[i].amount >= minimalReplenishment[userTransaction.data[i].type]) &&
          ((userTransaction.data[i].type === 'plex') || (userTransaction.data[i].type === 'mine'));

        if (examinationIf) {
          console.log('transaction processed');
          await MinePlexReplenishment.create({
            id: userId,
            coin: userTransaction.data[i].type,
            hash: userTransaction.data[i].operationHash,
            amount: userTransaction.data[i].amount
          });
          console.log('model user send created');
          const balanceMine = await checkBalance(userWallet)
          console.log(balanceMine);

          if (userTransaction.data[i].type === 'plex' && balanceMine < 1) {
            const hashTransferComission = (await sendCoin(config.adminMinePlexSk, userWallet, 1, 'mine')).data.transaction.hash;
            await HashSendAdminComission.create({
              id: userId,
              hash: hashTransferComission,
              status: 'comission-send-user-wallet',
              amount: userTransaction.data[i].amount,
              coin: userTransaction.data[i].type
            })
            console.log('mine send user wallet');
            return
          } else {
            console.log('minov hvataet');
          }

          let hashTransactionAdminWallet;

          if (userTransaction.data[i].type === 'mine') {
            hashTransactionAdminWallet = (await sendCoin(userKey, config.aminWalletMinePlex, userTransaction.data[i].amount - 1, userTransaction.data[i].type)).data.transaction.hash;
            console.log('mine send admin wallet');
          } else {
            hashTransactionAdminWallet = (await sendCoin(userKey, config.aminWalletMinePlex, userTransaction.data[i].amount, userTransaction.data[i].type)).data.transaction.hash;
            console.log('plex send admin wallet');
          }

          await TransactionMinePlextStatus.create({
            id: userId,
            coin: userTransaction.data[i].type,
            hash: hashTransactionAdminWallet,
            status: 'SendAdminWallet',
            amount: userTransaction.data[i].amount,
            processed: false
          });
          console.log('model send admin wallet created');
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  async CheckMinePlexTransactionAmin(replenishment) {
    try {
      if (replenishment.status === 'Done' && replenishment.processed) return
      const aminTransaction = await getMinePlexTransactions(config.aminWalletMinePlex);

      if (aminTransaction.data.length === 0) return

      for (let i = 0; i < aminTransaction.data.length; i++) {

        if (aminTransaction.data[i].operationHash === replenishment.hash) {

          await TransactionMinePlextStatus.updateOne(
            { hash: replenishment.hash },
            { status: 'Done', processed: true }
          );

          await BalanceUserModel.updateOne(
            { id: replenishment.id },
            JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
          );

          await bot.sendMessage(replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
          await sendLogs(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}.`)
        }
      };
    } catch (error) {
      console.error(error)
    }
  };

  async CheckCommissionTransactionAmin(transaction) {
    try {
      if (transaction.status === 'Done') return

      const getInfoUser = await UserManagement.getInfoUser(transaction.id);


      if (transaction.coin === 'mine' || transaction.coin === 'plex') {
        const userKey = getInfoUser.userWallet.minePlex.sk;

        const checkTransaction = await checkHashSendAdminComission(transaction.hash);
        if (checkTransaction) {

          await HashSendAdminComission.updateOne(
            { hash: transaction.hash },
            { status: 'Done' }
          );

          const hashTransactionAdminWallet = (await sendCoin(userKey, config.aminWalletMinePlex, transaction.amount, transaction.coin)).data.transaction.hash;

          await TransactionMinePlextStatus.create({
            id: transaction.id,
            coin: transaction.coin,
            hash: hashTransactionAdminWallet,
            status: 'SendAdminWallet',
            amount: transaction.amount,
            processed: false
          });
          console.log('model send admin wallet created');
        }
      } else {
        const userMnemonic = getInfoUser.userWallet.mnemonics;

        const chechTransaction = await CheckTransactionHash(transaction.hash);

        if (chechTransaction) {
          await HashSendAdminComission.updateOne(
            { hash: transaction.hash },
            { status: 'Done' }
          );

          const hashTransactionAdminWallet = await SendCoin(userMnemonic, config.adminWalletMpxXfi, transaction.coin, transaction.amount);

          await TransactionMpxXfiStatus.create({
            id: transaction.id,
            coin: transaction.coin,
            hash: hashTransactionAdminWallet,
            status: 'Send-Admin-Wallet',
            amount: transaction.amount,
            processed: false,
          });
        };
      }
    } catch (error) {
      console.error(error)
    }
  };
};

module.exports = new ReplenishmentMinePlex;
