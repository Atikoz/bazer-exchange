import MinterReplenishment from "../../model/minter/modelMinterReplenishment";
import MinterTransaction from "../../function/minterFunction";
import sleep from "../../helpers/sleepFunction";
import getInfoUser from "../../service/getInfoUser";
import TransactionMinterStatus from "../../model/minter/modelMinterStatusTransaction";
import config from "../../config";
import sendMessage from "../../helpers/sendMessage";
import sendLogs from "../../helpers/sendLog";
import BalanceUserModel from "../../model/modelBalance";

interface UserTransaction {
  hash: string;
  data: {
    coin: {
      id: number,
      symbol: string;
    };
    to: string;
    value: number;
  };
}

interface Transaction {
  hash: string;
  status: string;
  coin: string;
  amount: number;
  id: string;
}

interface ResultTx {
  code: string;
}

class ReplenishmentMinter {
  public async checkUserTransaction(id: number): Promise<void> {
    try {
      const infoUser = await getInfoUser(id);
      const userAddress = infoUser.userWallet.minter.address;
      const userSeed = infoUser.userWallet.mnemonics;

      const minimumAmounts: { [key: string]: number } = {
        BIP: 100,
        HUB: 0.01,
        MONSTERHUB: 0.01,
        BNB: 0.0001,
        USDTBSC: 2,
        BIPKAKAXA: 30,
        CASHBSC: 500,
        BAZERCOIN: 50,
        RUBLE: 5
      };

      const userTransactionAnswer = await sleep(5000).then(async () => await MinterTransaction.getTransaction(userAddress));

      if (!userTransactionAnswer.status) return

      const userTransactionArr: UserTransaction[] = userTransactionAnswer.tx;
      userTransactionArr.forEach(async transaction => {

        const coin = transaction.data.coin.symbol;
        const minimumAmount = minimumAmounts[coin];

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
            coin === 'RUBLE') &&
          transaction.data.to === userAddress &&
          +transaction.data.value >= minimumAmount;

        if (requirements) {
          console.log('found trancsaction');

          const coinIdAnswer = await MinterTransaction.getCoinId(coin);

          if (!coinIdAnswer.status) return

          const commissionTransfer = await sleep(5000).then(async () => await MinterTransaction.getCommissionTx(config.adminMinterWallet, transaction.data.value, coinIdAnswer.id));
          console.log('commission send', coin, 'tx: ', commissionTransfer);

          if (coin === 'BIP') {
            const amountTransferAdminWallet = transaction.data.value - 35;
            console.log('amountTransferAdminWallet: ', amountTransferAdminWallet);

            const sendBipAdminWallet = await sleep(5000).then(async () => await MinterTransaction.sendMinter(config.adminMinterWallet, amountTransferAdminWallet, userSeed, coin));

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
            const responceBalanceMinter = await MinterTransaction.getBalance(userAddress);
            if (!responceBalanceMinter.status) return


            const arrayBalance = Array.isArray(responceBalanceMinter.arrayBalance)
              ? responceBalanceMinter.arrayBalance
              : responceBalanceMinter.arrayBalance.balance;

            const objectBip = arrayBalance.find((element) => element.coin.symbol === 'BIP') ?? null;

            if (!(objectBip && typeof objectBip.value === 'number')) return

            const balanceBip = objectBip.value / 1e18;
            console.log(balanceBip);

            if (commissionTransfer > balanceBip) {
              const numberOfNeededCoins = commissionTransfer - balanceBip;
              await MinterTransaction.sendMinter(userAddress, numberOfNeededCoins, config.adminMinterMnemonic, 'bip').then(async () => await sleep(10000));
            }
            const sendCoinAdminWallet = await MinterTransaction.sendMinter(config.adminMinterWallet, +transaction.data.value, userSeed, coin);

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
      console.error(error);
      return
    }
  }

  public async balanceCheckAdminWallet(): Promise<void> {
    try {
      const transactions = await TransactionMinterStatus.find();
      const adminTransactions: Transaction[] = transactions.filter((tx: Transaction) => tx.status !== 'Done');

      if (adminTransactions.length === 0) return;
      
      adminTransactions.forEach(async (transaction) => {
        const resultTx: ResultTx = await sleep(5000).then(async () => await MinterTransaction.checkMinterHash(transaction.hash));
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

export default new ReplenishmentMinter;