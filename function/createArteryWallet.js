const { Wallet } = require('dem-api');
const axios = require('axios');
const crypto = require('crypto');
const config = require('../config.js');
const WalletUserModel = require('../model/user/modelWallet.js');
const BalanceUserModel = require('../model/user/modelBalance.js');
const sleep = require('../helpers/sleepFunction.js');

const referAcc = 'artr17yvfmrelm4ejd40yz056j0gc2seqr32dazhclj';


async function createAccount(wallet, address, nickname, nodeUrl) {
  const txData = Wallet.wrap(wallet.createAccount(address, referAcc, nickname));
  const response = await axios(nodeUrl + '/cosmos/tx/v1beta1/txs', {
    method: 'POST',
    data: JSON.stringify(txData)
  })

  const txResult = await response.data;

  console.log(txResult);

  if (txResult.tx_response.code !== 0) {
    console.log('Отправка транзакции в БЧ завершилась с ошибкой ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
    throw Error('TX broadcast failed with code ' + txResult.tx_response.code + ": " + txResult.tx_response.data);
  }

  console.log('Адресс кошелька: ', address);

  return address
};

const createArteryManyWallet = async (arr) => {
  const seed = config.adminArteryMnemonic;
  console.log('admnim mnemonic: ', seed);
  const wallet = new Wallet(seed);
  const arrayMnemonic = arr.map(item => item.mnemonic);
  const arrayUser = arr.map(item => item.id);

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
  wallet.setAccNo(accData.data.account.account_number + '');

  // Sequence Number - порядковый номер транзакции с момента создания аккаунта (получается запросом выше)
  wallet.setSequence(accData.data.account.sequence + '')

  for (let i = 0; i < arrayMnemonic.length; i++) {
    await sleep(10000)
    // Создаем новый сид для пользователя (или делаем ключ другим удобным способом)
    // Получаем кошелек из сида
    console.log('select user: ', arrayUser[i]);
    console.log('select mnemonic: ', arrayMnemonic[i]);

    const newAcc = new Wallet(arrayMnemonic[i]);

    // Для простоты никнейм делаем из адреса простым хешированием
    let nickname = crypto.createHash('md5').update(newAcc.address).digest("hex");

    const adressCreatedWallet = await createAccount(wallet, newAcc.address, nickname, nodeUrl);
    wallet.setSequence(Number(wallet.sequence) + 1);
    await WalletUserModel.updateOne(
      { id: arrayUser[i] },
      JSON.parse(`{ "$set" : { "artery.address": "${adressCreatedWallet}" } }`)
    );
  };
  console.log('wallets artery created');
};

const createUserArteryWallet = async (mnemonic) => {
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
    wallet.setAccNo(accData.account.account_number + '');

    // Sequence Number - порядковый номер транзакции с момента создания аккаунта (получается запросом выше)
    wallet.setSequence(accData.account.sequence + '')
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

module.exports = {
  createArteryManyWallet,
  createUserArteryWallet
};


