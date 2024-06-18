import getInfoUser from "../../service/getInfoUser";
import sleep from "../../helpers/sleepFunction";
import minePlex from "../../function/minePlexFunction";
import mpxXfi from "../../function/mpxXfiFunction";
import MinePlexReplenishment from "../../model/minePlex/modelMinePlexReplenishment";
import config from "../../config";
import HashSendAdminComission from "../../model/minePlex/modelHashSendAdminComission";
import TransactionMinePlextStatus from "../../model/minePlex/modelMinePlexStatusTransactions";
import BalanceUserModel from "../../model/modelBalance";
import sendMessage from "../../helpers/sendMessage";
import sendLogs from "../../helpers/sendLog";
import TransactionMpxXfiStatus from "../../model/mpxXfi/modelMpxXfiStatusTransactions";



const minimalReplenishment: { [key: string]: number } = {
  mine: 2,
  plex: 2
};

interface AdminTransaction {
  id: string,
  hash: string,
  status: string,
  amount: number,
  coin: string
}

class ReplenishmentMinePlex {
  public async ReplenishmentUserWallet(userId: number): Promise<void> {
    try {
      const infoUser = await getInfoUser(userId);
      const userWallet = infoUser.userWallet.minePlex.address;
      const userKey = infoUser.userWallet.minePlex.sk;
      const userTransaction = await sleep(5000).then(async () => await minePlex.getMinePlexTransactions(userWallet));
      
      if (!userTransaction) return
      if (userTransaction.length === 0) return

      for (let i = 0; i < userTransaction.length; i++) {
        const amountReplesh: number = +userTransaction[i].amount;
        const examinationIf =
          (!await MinePlexReplenishment.findOne({ hash: userTransaction[i].operationHash })) &&
          (userTransaction[i].destination === userWallet) &&
          !(userTransaction[i].source === config.aminWalletMinePlex) &&
          (amountReplesh >= minimalReplenishment[userTransaction[i].type]) &&
          ((userTransaction[i].type === 'plex') || (userTransaction[i].type === 'mine'));

        if (examinationIf) {
          console.log('transaction processed');
          await MinePlexReplenishment.create({
            id: userId,
            coin: userTransaction[i].type,
            hash: userTransaction[i].operationHash,
            amount: userTransaction[i].amount
          });
          console.log('model user send created');
          const balanceMine = await sleep(5000).then(async () => await minePlex.checkBalance(userWallet));
          console.log(balanceMine);

          if (typeof balanceMine === 'string') return

          if (userTransaction[i].type === 'plex' && balanceMine < 1) {
            const responceSendCoin = await sleep(5000).then(async () => (await minePlex.sendCoin(config.adminMinePlexSk, userWallet, 1, 'mine')));
            if (!responceSendCoin) return
            const hashTransferComission = responceSendCoin.transaction.hash
            await HashSendAdminComission.create({
              id: userId,
              hash: hashTransferComission,
              status: 'comission-send-user-wallet',
              amount: userTransaction[i].amount,
              coin: userTransaction[i].type
            })
            console.log('mine send user wallet');
            return
          } else {
            console.log('minov hvataet');
          }

          let hashTransactionAdminWallet: string;

          if (userTransaction[i].type === 'mine') {
            const responceSendCoin = await sleep(5000).then(async () => (await minePlex.sendCoin(userKey, config.aminWalletMinePlex, +userTransaction[i].amount - 1, userTransaction[i].type)));
            if (!responceSendCoin) throw new Error("error send mine admin wallet");
            
            hashTransactionAdminWallet = responceSendCoin.transaction.hash;
            console.log('mine send admin wallet');
          } else {
            const responceSendCoin = await sleep(5000).then(async () => (await minePlex.sendCoin(userKey, config.aminWalletMinePlex, +userTransaction[i].amount, userTransaction[i].type)));
            if (!responceSendCoin) throw new Error("error send plex admin wallet");
            hashTransactionAdminWallet = responceSendCoin.transaction.hash;
            console.log('plex send admin wallet');
          }

          await TransactionMinePlextStatus.create({
            id: userId,
            coin: userTransaction[i].type,
            hash: hashTransactionAdminWallet,
            status: 'SendAdminWallet',
            amount: userTransaction[i].amount,
            processed: false
          });
          console.log('model send admin wallet created');
        }
      }
    } catch (error) {
      // console.error(error)
    }
  };

  public async CheckMinePlexTransactionAmin(replenishment: AdminTransaction): Promise<void> {
    try {
      if (replenishment.status === 'Done') return
      const aminTransaction = await sleep(5000).then(async () => await minePlex.getMinePlexTransactions(config.aminWalletMinePlex));

      if (!aminTransaction) return

      if (aminTransaction.length === 0) return

      for (let i = 0; i < aminTransaction.length; i++) {

        if (aminTransaction[i].operationHash === replenishment.hash) {

          await TransactionMinePlextStatus.updateOne(
            { hash: replenishment.hash },
            { status: 'Done', processed: true }
          );

          await BalanceUserModel.updateOne(
            { id: replenishment.id },
            JSON.parse(`{"$inc": { "main.${replenishment.coin}": ${replenishment.amount} } }`)
          );

          sendMessage(+replenishment.id, `Вас счет пополнено на ${replenishment.amount} ${replenishment.coin}`);
          await sendLogs(`Пользователь ${replenishment.id} пополнил баланс на ${replenishment.amount} ${replenishment.coin}.`)
        }
      };
    } catch (error) {
      console.error(error)
    }
  };

  public async CheckCommissionTransactionAmin(transaction: AdminTransaction) {
    try {
      if (transaction.status === 'Done') return

      const infoUser = await getInfoUser(+transaction.id);


      if (transaction.coin === 'mine' || transaction.coin === 'plex') {
        const userKey = infoUser.userWallet.minePlex.sk;

        const checkTransaction = await sleep(5000).then(async () => await minePlex.checkHashSendAdminComission(transaction.hash + ''));
        if (checkTransaction) {

          await HashSendAdminComission.updateOne(
            { hash: transaction.hash },
            { status: 'Done' }
          );

          const responceSendCoin = await sleep(5000).then(async () => (await minePlex.sendCoin(userKey, config.aminWalletMinePlex, +transaction.amount, transaction.coin + '')));
          if (!responceSendCoin) throw new Error("error send coin admin wallet");
          
          const hashTransactionAdminWallet = responceSendCoin.transaction.hash;
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
        const userMnemonic = infoUser.userWallet.mnemonics;

        const chechTransaction = await mpxXfi.checkTransactionHash(transaction.hash + '');

        if (chechTransaction) {
          await HashSendAdminComission.updateOne(
            { hash: transaction.hash },
            { status: 'Done' }
          );

          const hashTransactionAdminWallet = await sleep(5000).then(async () => await minePlex.sendCoin(userMnemonic, config.adminWalletMpxXfi, +transaction.amount, transaction.coin + ''));

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
      // console.error(error)
    }
  };
}

export default new ReplenishmentMinePlex;