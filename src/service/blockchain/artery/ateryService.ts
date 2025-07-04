
import { Wallet } from 'dem-api';
import EncryptionService from "../../security/EncryptionService";
import crypto from 'crypto';
import WalletUser from '../../../models/user/WalletUser';
import { IAdminTransactionArtery, ISendCoinsArtery } from '../../../interface/ArteryInterfaces';
import ArteryReplenishment from '../../../models/artery/modelArterySendAdmin';
import BalanceUser from '../../../models/user/BalanceModel';
import BotService from '../../telegram/BotService';

const ARTERY_NODE_URL = process.env.ARTERY_NODE_URL;
const ADMIN_WALLET_ARTERY = process.env.ADMIN_WALLET_ARTERY;
const ADMIN_MNEMONIK_ARTERY = process.env.ADMIN_MNEMONIK_ARTERY;
const referAcc = 'artr17yvfmrelm4ejd40yz056j0gc2seqr32dazhclj';


class ArteryService {
  private readonly nodeUrl = ARTERY_NODE_URL;
  private readonly adminArteryWallet = ADMIN_WALLET_ARTERY;
  private readonly adminArteryMnemonic = ADMIN_MNEMONIK_ARTERY;

  private async createAccount(wallet: Wallet, address: string, nickname: string, nodeUrl: string): Promise<string> {
    const txData = Wallet.wrap(wallet.createAccount(address, referAcc, nickname));

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(txData),
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch(`${nodeUrl}/cosmos/tx/v1beta1/txs`, requestOptions);
    const txResult = await response.json();

    console.log(txResult);

    if (txResult.tx_response.code !== 0) {
      console.log('Отправка транзакции в БЧ завершилась с ошибкой ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
      throw Error('TX broadcast failed with code ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
    }

    console.log('Адресс кошелька: ', address);

    return address
  };

  public createArteryManyWallet = async (arr: { id: number, mnemonic: string }[]): Promise<void> => {
    const seed = this.adminArteryMnemonic;
    console.log('admnim mnemonic: ', seed);
    const wallet = new Wallet(seed);
    const arrayMnemonic = arr.map(item => item.mnemonic);
    const arrayUser = arr.map(item => item.id);

    console.log('Получаем данные для подписи запроса')

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const accData = await fetch(`${this.nodeUrl}/cosmos/auth/v1beta1/accounts/${wallet.address}`, requestOptions);
    const accDataJson = await accData.json();

    // Текущая версия сети Artery Blockchain
    wallet.setChainId('artery_network-10')

    wallet.setAccNo(accDataJson.account.account_number + '');
    wallet.setSequence(accDataJson.account.sequence + '')

    for (let i = 0; i < arrayMnemonic.length; i++) {
      console.log('select user: ', arrayUser[i]);
      console.log('select mnemonic: ', arrayMnemonic[i]);

      const newAcc = new Wallet(arrayMnemonic[i]);

      let nickname = crypto.createHash('md5').update(newAcc.address).digest("hex");

      const adressCreatedWallet = await this.createAccount(wallet, newAcc.address, nickname, this.nodeUrl);
      wallet.setSequence(Number(wallet.sequence) + 1);

      await WalletUser.updateOne(
        { id: arrayUser[i] },
        JSON.parse(`{ "$set" : { "artery.address": "${adressCreatedWallet}" } }`)
      );
    };
    console.log('wallets artery created');
  };

  public createUserArteryWallet = async (mnemonic: string): Promise<string> => {
    const seed = this.adminArteryMnemonic;
    const wallet = new Wallet(seed);

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    try {
      const response = await fetch(`${this.nodeUrl}/cosmos/auth/v1beta1/accounts/${wallet.address}`, requestOptions);
      const accData = await response.json();
      console.log(accData);

      // Текущая версия сети Artery Blockchain
      wallet.setChainId('artery_network-10')

      // Номер аккаунта в БЧ (получается запросом выше)
      wallet.setAccNo(accData.account.account_number + '');

      // Sequence Number - порядковый номер транзакции с момента создания аккаунта (получается запросом выше)
      wallet.setSequence(accData.account.sequence + '')
      // Создаем новый сид для пользователя (или делаем ключ другим удобным способом)
      // Получаем кошелек из сида
      const newAcc = new Wallet(mnemonic);
      // Для простоты никнейм делаем из адреса простым хешированием
      let nickname = crypto.createHash('md5').update(newAcc.address).digest("hex");

      const adressCreatedWallet = await this.createAccount(wallet, newAcc.address, nickname, this.nodeUrl);

      return adressCreatedWallet
    } catch (error) {
      console.error(error);
    }
  }

  private async authWallet(seed: string, isWithdraw: boolean): Promise<Wallet> {
    if (!isWithdraw) {
      seed = EncryptionService.decryptSeed(seed)
    }
    const wallet = new Wallet(seed);

    try {
      const requestOptions: RequestInit = {
        method: "GET",
        redirect: "follow" as RequestRedirect
      };

      // Получаем адрес кошелька
      const accData = await fetch(`${this.nodeUrl}/cosmos/auth/v1beta1/accounts/${wallet.address}`, requestOptions);
      const accDataJson = await accData.json();

      console.log(accDataJson)

      //текущая версия сети Artery Blockchain
      wallet.setChainId('artery_network-10');

      // Homep. akkayhta B 54 (nonyuaetca 3anpocoM више)
      wallet.setAccNo(accDataJson.account.account_number + '');

      // Sequence Number -  порядковый номер транзакции с момента создания аккаунта
      wallet.setSequence(accDataJson.account.sequence + '');
      return wallet;
    } catch (error) {
      console.error(`Error in authWallet: `, error);
      throw error
    }
  };

  public async sendArtery(seed: string, recipient: string, amount: number, isWithdraw = false): Promise<ISendCoinsArtery> {
    try {
      console.log(`seed: ${seed}`)
      console.log(`recipient: ${recipient}`)
      console.log(`amount: ${amount}`)
      console.log('isWithdraw flag:', isWithdraw);

      amount = amount * 1e6;

      const wallet = await this.authWallet(seed, isWithdraw);
      // Резолвим адрес из ника / адреса Arteru / bech32 (sdk) адреса
      recipient = recipient.toLowerCase();
      // Не bech32 адрес
      if (recipient.indexOf('artr1') === -1) {
        //artr-xxxx.... адрес
        if (recipient.indexOf('artr-') === 0) {
          let cardNumber = recipient.replace(/\D/g, '');

          const requestOptions: RequestInit = {
            method: "GET",
            redirect: "follow" as RequestRedirect
          };

          const result = await fetch(`${this.nodeUrl}/artery/profile/v1beta1/get_by_card/${cardNumber}`, requestOptions);
          const resultJson = await result.json();

          if (result && resultJson && resultJson.address) {
            recipient = resultJson.address;
          } else {
            throw Error('Account with address ' + recipient + ' not found in blockchain');
          }
        } else { //Ник
          const requestOptions: RequestInit = {
            method: "GET",
            redirect: "follow" as RequestRedirect
          };

          const result = await fetch(`${this.nodeUrl}/artery/profile/v1beta1/get_by_nick/${recipient}`, requestOptions);
          const resultJson = await result.json();

          if (result && resultJson && resultJson.address) {
            recipient = resultJson.address;
          } else {
            throw Error('Account with nickname ' + recipient + ' not found in blockchain')
          }
        }
      };

      const txData = Wallet.wrap(wallet.send(recipient, amount, '', "80000000"));

      const requestOptions: RequestInit = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(txData),
        redirect: "follow" as RequestRedirect
      };

      const txResult = await fetch(`${this.nodeUrl}/cosmos/tx/v1beta1/txs`, requestOptions);
      const txResultJson = await txResult.json();


      console.log('artery transfer done');

      return txResultJson.tx_response;
    } catch (error) {
      console.error(`error sending artery: ${error.message}`);
      throw error
    }
  };

  public async withdrawCoins(address: string, amount: number): Promise<ISendCoinsArtery | null> {
    try {
      const result = await this.sendArtery(this.adminArteryMnemonic, address, amount, true);

      if (result.code != 0) {
        throw new Error(`Error withdraw artery coins`);
      }

      return result
    } catch (error) {
      throw error
    }
  }

  // convertAddress = async (address) => {
  //   const config = {
  //     method: 'get',
  //     url: `http://167.172.51.179:1317/artery/profile/v1beta1/get_by_card/${address}`,
  //     headers: {}
  //   };

  //   return axios.request(config)
  //     .then((response) => {
  //       console.log('convert address: ', response.data.address);
  //       return response.data.address
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }

  private getBalance = async (address: string): Promise<number> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    try {
      const response = await fetch(`${this.nodeUrl}/artery/bank/v1beta1/balance/${address}`, requestOptions);
      const result = await response.json();

      if (result.balance && result.balance.length > 0) {
        const responceBalance = result.balance[0].amount;
        const balance = +responceBalance / 1e6;

        return balance;
      } else {
        console.log('balance 0');
        return 0; // Або інше значення за замовчуванням
      }
    } catch (error) {
      console.error(`error getting balance: `, error);

      return 0;
    }
  };

  //проверка баланса пользователя
  public checkUserBalance = async (userId: number, seed: string, address: string): Promise<void> => {
    try {
      seed = EncryptionService.decryptSeed(seed)
      const balanceUser = await this.getBalance(address);

      if (balanceUser < 1) {
        return
      };

      console.log("баланс пользователя", userId, balanceUser, "artr");

      const amountToSend = +(balanceUser - balanceUser * 0.0055).toFixed(5);
      const sendResult = await this.sendArtery(seed, this.adminArteryWallet, amountToSend);

      console.log('sendCoin responce:', sendResult);
      console.log('sendCoin hash:', sendResult.txhash);


      //проверка создания транзакции
      if (sendResult.code != 0) {
        return
      }

      await ArteryReplenishment.create({
        id: userId,
        hash: sendResult.txhash,
        amount: balanceUser,
        status: 'user-send-coin',
      }).then((r) => console.log('Создана заявка на проверку транзакции (ARTR). Hash: ' + r.hash));
    } catch (error) {
      console.error(`erorr checking admin balance: ${error.message}`);
      throw error
    }
  };

  private checkHash = async (hash: string): Promise<boolean> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    try {
      const response = await fetch(`${this.nodeUrl}/cosmos/tx/v1beta1/txs/${hash}`, requestOptions);
      const result = await response.json();

      return result.tx_response?.code === 0;
    } catch (error) {
      console.error(`error checking tx artery: `, error);

      return false
    }
  };

  public checkAdminWallet = async (transaction: IAdminTransactionArtery): Promise<void> => {
    try {
      const statusUserTransaction = await this.checkHash(transaction.hash);

      if (!statusUserTransaction) {
        return
      };
      await ArteryReplenishment.updateOne(
        { hash: transaction.hash },
        { status: 'Done' }
      );

      const updateBalanceQuery = { id: transaction.id };
      const updateBalanceUpdate = { $inc: { "main.artery": transaction.amount } };
      await BalanceUser.updateOne(updateBalanceQuery, updateBalanceUpdate);

      const message = `Вас счет пополнено на ${transaction.amount} artery`;
      const logMessage = `Пользователь ${transaction.id} пополнил баланс на ${transaction.amount} artery`;

      await Promise.all([
        BotService.sendMessage(transaction.id, message),
        BotService.sendLog(logMessage)
      ])
    } catch (error) {
      console.error(`error checking tx in admin wallet: `, error);
    }
  };
}

export default new ArteryService;