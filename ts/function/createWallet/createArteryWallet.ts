import axios from 'axios';
import crypto from 'crypto';
import config from '../../config';
import WalletUserModel from '../../model/modelWallet';
import BalanceUserModel from '../../model/modelBalance';
import Wallet from 'dem-api/src/Wallet';

const referAcc = 'artr17yvfmrelm4ejd40yz056j0gc2seqr32dazhclj';

interface User {
  id: string;
  mnemonics: string;
};

interface ArteryFunctionsObj {
  createArteryManyWallet: (arr: User[]) => Promise<void>,
  createUserArteryWallet: (mnemonic: string) => Promise<string | void>
}

async function createAccount(wallet: Wallet, address: string, nickname: string, nodeUrl: string): Promise<string> {
  const txData = Wallet.wrap(wallet.createAccount(address, referAcc, nickname));
  const response = await axios(nodeUrl + '/cosmos/tx/v1beta1/txs', {
    method: 'POST',
    data: JSON.stringify(txData)
  })
  Wallet
  const txResult = await response.data;

  console.log(txResult);

  if (txResult.tx_response.code !== 0) {
    console.log('Отправка транзакции в БЧ завершилась с ошибкой ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
    throw Error('TX broadcast failed with code ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
  }

  console.log('Адресс кошелька: ', address);

  return address
};

const createArteryWallet: ArteryFunctionsObj = {
  createArteryManyWallet: async function (arr: User[]): Promise<void> {
    const seed = config.adminArteryMnemonic;
    const wallet = new Wallet(seed);
    const arrayMnemonic = arr.map((item) => item.mnemonics);
    const arrayUser = arr.map((item) => item.id);

    // Url ноды к которой слать запросы
    const nodeUrl = 'http://167.172.51.179:1317';

    console.log('Получаем данные для подписи запроса')

    // Получаем текущие данные аккаунта
    // Примичание - данные обновляются раз в блок. Если отправляется несколько транзакций подряд - за sequence number
    // необходимо следить самостоятельно!
    const accData = await axios(nodeUrl + '/cosmos/auth/v1beta1/accounts/' + wallet.address);

    // Текущая версия сети Artery Blockchain
    wallet.setChainId('artery_network-10')

    // Номер аккаунта в БЧ (получается запросом выше)
    wallet.setAccNo(+accData.data.account.account_number);

    // Sequence Number - порядковый номер транзакции с момента создания аккаунта (получается запросом выше)
    wallet.setSequence(+accData.data.account.sequence)

    for (let i = 0; i < arrayMnemonic.length; i++) {
      // Создаем новый сид для пользователя (или делаем ключ другим удобным способом)
      // Получаем кошелек из сида
      console.log('select user: ', arrayUser[i]);
      console.log('select mnemonic: ', arrayMnemonic[i]);

      const newAcc = new Wallet(arrayMnemonic[i]);

      // Для простоты никнейм делаем из адреса простым хешированием

      let nickname = crypto.createHash('md5').update(newAcc.address).digest("hex");

      const adressCreatedWallet = await createAccount(wallet, newAcc.address, nickname, nodeUrl);
      wallet.setSequence(Number(wallet.sequence) + 1);
      await WalletUserModel.updateMany(
        { id: arrayUser[i] },
        JSON.parse(`{ "$set" : { "artery.address": "${adressCreatedWallet}" } }`)
      );

      // await BalanceUserModel.updateOne(
      //   { id: u.id },
      //   JSON.parse(`{ "$inc" : { "main.artery": "0", "hold.artery": "0"} }`)
      // );
    };
    console.log('wallets artery created');
  },
  createUserArteryWallet: async function (mnemonic: string): Promise<string | void> {
  try {
    const seed = config.adminArteryMnemonic;
    const wallet = new Wallet(seed);

    // Url ноды к которой слать запросы
    const nodeUrl = 'http://167.172.51.179:1317';

    // Получаем текущие данные аккаунта
    // Примичание - данные обновляются раз в блок. Если отправляется несколько транзакций подряд - за sequence number
    // необходимо следить самостоятельно!
    const response = await axios.get(nodeUrl + '/cosmos/auth/v1beta1/accounts/' + wallet.address);
    const accData = response.data;
    console.log(accData);

    // Текущая версия сети Artery Blockchain
    wallet.setChainId('artery_network-10')

    // Номер аккаунта в БЧ (получается запросом выше)
    wallet.setAccNo(+accData.account.account_number);

    // Sequence Number - порядковый номер транзакции с момента создания аккаунта (получается запросом выше)
    wallet.setSequence(+accData.account.sequence)
    // Создаем новый сид для пользователя (или делаем ключ другим удобным способом)
    // Получаем кошелек из сида
    const newAcc = new Wallet(mnemonic);
    // Для простоты никнейм делаем из адреса простым хешированием
    let nickname = crypto.createHash('md5').update(newAcc.address).digest("hex");

    const adressCreatedWallet = await createAccount(wallet, newAcc.address, nickname, nodeUrl);

    return adressCreatedWallet
  } catch (error) {
    console.error(error);
  }
  }
}

export default createArteryWallet;