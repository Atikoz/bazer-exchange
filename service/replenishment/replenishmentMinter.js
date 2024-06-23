const UserManagement = require('../userManagement.js');
const { getTransaction, getCommissionTx, checkMinterHash, sendMinter, getCoinId, getBalance } = require('../../function/minterTransaction.js');
const MinterReplenishment = require('../../model/modelMinterReplenishment.js');
const config = require('../../config.js');
const TransactionMinterStatus = require('../../model/modelMinterStatusTransaction.js');
const BalanceUserModel = require('../../model/modelBalance.js');
const sendLogs = require('../../helpers/sendLog.js');
const sendMessage = require('../../helpers/tgFunction.js');
const sleep = require('../../helpers/sleepFunction.js');


class ReplenishmentMinter {
  checkUserTransaction = async (id) => {
    try {
      const getInfoUser = await UserManagement.getInfoUser(id);
      const userAddress = getInfoUser.userWallet.minter.address;
      const userSeed = getInfoUser.userWallet.mnemonics;

      const minimumAmounts = {
        BIP: 100,
        HUB: 0.01,
        MONSTERHUB: 0.01,
        BNB: 0.0001,
        USDTBSC: 2,
        BIPKAKAXA: 30,
        CASHBSC: 500,
        BAZERCOIN: 50,
        RUBLE: 5,
        BAZERHUB: 0.5
      };

      const userTransactionArr = await sleep(5000).then(async () => await getTransaction(userAddress));

      userTransactionArr.forEach(async transaction => {

        const coin = transaction.data.coin.symbol;
        const minimumAmount = minimumAmounts[coin];
        console.log('coin', coin)


        const requirements =
          !(await MinterReplenishment.findOne({ id: id, hash: transaction.hash })) &&
           (coin === 'BIP' ||
            coin === 'HUB' ||
            coin === 'MONSTERHUB' ||
            coin === 'BNB' ||
            coin === 'USDTBSC' ||
            coin === 'BIPKAKAXA' ||
            coin === 'CASHBSC' ||
            coin === 'BAZERCOIN' ||
            coin === 'RUBLE' ||
            coin === 'BAZERHUB') &&
          transaction.data.to === userAddress &&
          +transaction.data.value >= minimumAmount;

        if (requirements) {
          console.log('found trancsaction');

          const coinId = await getCoinId(coin);
          const commissionTransfer = await sleep(5000).then(async () => await getCommissionTx(config.adminMinterWallet, transaction.data.value, coinId));
          console.log('commission send', coin, 'tx: ', commissionTransfer);

          if (coin === 'BIP') {
            const amountTransferAdminWallet = transaction.data.value - 35;
            console.log('amountTransferAdminWallet: ', amountTransferAdminWallet);

            const sendBipAdminWallet = await sleep(5000).then(async () => await sendMinter(config.adminMinterWallet, amountTransferAdminWallet, userSeed, coin));

            if (!sendBipAdminWallet.status) return console.log('transfer error: ', sendBipAdminWallet.error);
            console.log('coins send amin wallet');

            await TransactionMinterStatus.create({
              id: id,
              hash: sendBipAdminWallet.hash,
              status: 'Send Admin',
              amount: transaction.data.value,
              coin: coin
            })
          } else {
            const objectBip = (await getBalance(userAddress)).find((element) => element.coin.symbol === 'BIP') ?? null;
            const balanceBip = objectBip.value / 1e18;
            console.log(balanceBip);
            if (commissionTransfer > balanceBip) {
              const numberOfNeededCoins = commissionTransfer - balanceBip;
              await sendMinter(userAddress, numberOfNeededCoins, config.adminMinterMnemonic, 'bip').then(async () => await sleep(10000));
            }
            const sendCoinAdminWallet = await sendMinter(config.adminMinterWallet, transaction.data.value, userSeed, coin);

            await TransactionMinterStatus.create({
              id: id,
              hash: sendCoinAdminWallet.hash,
              status: 'Send Admin',
              amount: transaction.data.value,
              coin: coin
            })
          }

            await MinterReplenishment.create({
              id: id,
              hash: transaction.hash,
              amount: transaction.data.value,
              coin: coin
            });

            console.log('minter hash model created');
        }
      });
    } catch (error) {
      // console.error(error)
      return
    }   
  };

  balanceCheckAdminWallet = async () => {
    try {
      const adminTransactions = (await TransactionMinterStatus.find()).filter(tx => tx.status !== 'Done');
      if (adminTransactions.length === 0) return
      
      adminTransactions.forEach(async (transaction) => {
        const resultTx = await sleep(5000).then(async () => await checkMinterHash(transaction.hash));
        let coin = transaction.coin;
  
        if (resultTx.code === "0") {
          await TransactionMinterStatus.updateOne(
            { hash: transaction.hash },
            { status: 'Done' }
          );

          if (coin === 'BAZERCOIN') {
            await BalanceUserModel.updateOne(
              { id: transaction.id },
              { $inc: { ['main.minterBazercoin']: transaction.amount } }
            );

            sendMessage(transaction.id, `Ваш счет был пополнен на ${transaction.amount} BAZERCOIN (Minter)`);
            sendLogs(`Пользователь ${transaction.id} пополнил счет на ${transaction.amount} BAZERCOIN (Minter)`);
          } else {
            await BalanceUserModel.updateOne(
              { id: transaction.id },
              { $inc: { [`main.${coin.toLowerCase()}`]: transaction.amount } }
            );
    
            sendMessage(transaction.id, `Ваш счет был пополнен на ${transaction.amount} ${coin.toUpperCase()}`);
            sendLogs(`Пользователь ${transaction.id} пополнил счет на ${transaction.amount} ${coin.toUpperCase()}`);
          }
        } else {
          console.log(resultTx);
          sendMessage(transaction.id, `При пополнении возникла ошибка, обратитесь в техподдержку`);
        }
      })
    } catch (error) {
      // console.error(error)
    }
  };
}

module.exports = new ReplenishmentMinter;