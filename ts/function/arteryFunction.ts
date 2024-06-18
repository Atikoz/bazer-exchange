import axios from 'axios';
import Wallet from 'dem-api/src/Wallet';
import config from '../config';
import ArteryReplenishment from '../model/artery/modelArterySendAdmin';
import BalanceUserModel from '../model/modelBalance';
import sendMessage from '../helpers/sendMessage';
import sendLog from '../helpers/sendLog';


interface ISendCoinResponceApi {
txhash: string,
code: number
}

export interface IArteryTransaction {
  id: string,
  hash: string,
  amount: number,
  amountCommission: number,
  status: string
}


const nodeUrl: string = 'http://167.172.51.179:1317';

class ReplenishmentArtery {
  public async authWallet(seed: string): Promise<Wallet | void> {
    try {
      const wallet = new Wallet(seed);
      const accData = await axios({
        method: 'GET',
        url: nodeUrl + '/cosmos/auth/v1beta1/accounts/' + wallet.address
      });

      //текущая версия сети Artery Blockchain
      wallet.setChainId('artery_network-10');

      // Homep. akkayhta B 54 (nonyuaetca 3anpocoM више)
      wallet.setAccNo(accData.data.account.account_number);

      // Sequence Number -  порядковый номер транзакции с момента создания аккаунта
      wallet.setSequence(accData.data.account.sequence);
      return wallet;
    } catch (error) {
      console.error(error);
    }
  };

  public async sendArtery(seed: string, recipient: string, amount: number): Promise<ISendCoinResponceApi | void> {
    try {
      amount = amount * 1e6;
      const wallet = await this.authWallet(seed);

      if (!wallet) {
        throw new Error('Wallet authentication failed');
      }

      // Резолвим адрес из ника / адреса Arteru / bech32 (sdk) адреса
      recipient = recipient.toLowerCase();
      // Не bech32 адрес
      if (recipient.indexOf('artr1') === -1) {
        //artr-xxxx.... адрес
        if (recipient.indexOf('artr-') === 0) {
          let cardNumber = recipient.replace(/\D/g, '');

          const result = await axios({
            method: 'GET',
            url: nodeUrl + '/artery/profile/v1beta1/get_by_card/' + cardNumber
          });

          if (result && result.data.address) {
            recipient = result.data.address;
          } else {
            throw Error('Account with address ' + recipient + ' not found in blockchain');
          }
        } else { //Ник
          const result = await axios({
            method: 'GET',
            url: nodeUrl + '/artery/profile/v1beta1/get_by_nick/' + recipient
          });

          if (result && result.data.address) {
            recipient = result.data.address;
          } else {
            throw Error('Account with nickname ' + recipient + ' not found in blockchain')
          }
        }
      };

      const txData = Wallet.wrap(wallet.send(recipient, amount + '', '', "80000000"));
      const txResult = await axios({
        method: 'POST',
        url: nodeUrl + '/cosmos/tx/v1beta1/txs',
        data: JSON.stringify(txData)
      })

      console.log('artery transfer done');

      return txResult.data.tx_response;
    } catch (error) {
      console.error(error);
    }
  };

  public getBalanceArtery = async (address: string): Promise<number> => {
    try {
      const config = {
        method: 'get',
        url: `http://167.172.51.179:1317/artery/bank/v1beta1/balance/${address}`,
        headers: {}
      };

      const response = await axios.request(config);

      if (response.data.balance && response.data.balance.length > 0) {
        const responceBalance: string = response.data.balance[0].amount;
        const balance: number = +responceBalance / 1e6;
        
        return balance;
      } else {
        console.log('balance 0');
        return 0; // Або інше значення за замовчуванням
      }
    } catch (error) {
      console.error(error);
      // Тут ви також можете обробляти помилки і повертати відповідні значення
      return 0;
    }
  };

  public checkBalanceArtery = async (userId: number, seed: string, address: string): Promise<void> => {
    try {
      const balanceUser = await this.getBalanceArtery(address);
      //проверка баланса пользователя
      if (balanceUser < 1) return;
      console.log("баланс пользователя", userId, balanceUser, "artr");

      const totalAmountARTR = (balanceUser - balanceUser * 0.0055).toFixed(5);
      const sendCoin = await this.sendArtery(seed, config.adminArteryWallet, +totalAmountARTR);

      if (!sendCoin) return

      console.log('sendCoin responce:', sendCoin);
      console.log('sendCoin hash:', sendCoin.txhash);


      //проверка создания транзакции
      if (sendCoin.code != 0) return

      await ArteryReplenishment.create({
        id: userId,
        hash: sendCoin.txhash,
        amount: balanceUser,
        status: 'user-send-coin',
      }).then((r) => console.log('Создана заявка на проверку транзакции (ARTR). Hash: ' + r.hash));
    } catch (error) {
      console.error(error);
    }
  };

  public checkHash = async (hash: string): Promise<boolean> => {
    try {
      const config = {
        method: 'get',
        url: `http://167.172.51.179:1317/cosmos/tx/v1beta1/txs/${hash}`,
        headers: {}
      };

      const response = await axios.request(config)
      const transactionResponse = response.data.tx_response;

      return transactionResponse && transactionResponse.code === 0 ? true : false;
    } catch (error) {
      console.error(error);
      return false
    }
  };

  public checkAdminWallet = async (transaction: IArteryTransaction): Promise<void> => {
    try {
      if (transaction.status === 'Done') return;

      const statusUserTransaction = this.checkHash(transaction.hash);

      if (!statusUserTransaction) return;

      await ArteryReplenishment.updateOne(
        { hash: transaction.hash },
        { status: 'Done' }
      );

      const updateBalanceQuery = { id: transaction.id };
      const updateBalanceUpdate = { $inc: { "main.artery": transaction.amount } };
      await BalanceUserModel.updateOne(updateBalanceQuery, updateBalanceUpdate);

      const message = `Вас счет пополнено на ${transaction.amount} artery`;
      const logMessage = `Пользователь ${transaction.id} пополнил баланс на ${transaction.amount} artery`;

      await Promise.all([
        sendMessage(transaction.id, message),
        sendLog(logMessage)
      ])
    } catch (error) {
      console.error(error)
    }
  }
}

export default new ReplenishmentArtery;