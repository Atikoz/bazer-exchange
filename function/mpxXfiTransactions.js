const axios = require('axios');
const qs = require('qs');


const getMpxXfiTransactions = async (wallet) => {
  try {
    let config = {
      method: 'get',
      url: `https://explorer-api.mineplex.io/txs?address=${wallet}&page=0`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      if(response.data)
      return response.data.txs
    })
  } catch (error) {
    console.error(error);
  }
};

const CheckTransactionHash = async (hash) => {
  try {
    let config = {
      method: 'get',
      url: `https://explorer-api.mineplex.io/tx/${hash}`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(response.data);
      return response.data.txhash
    })
  } catch (error) {
    console.error(error)
  };
};

const CheckBalance = async (wallet) => {
  try {
    const config = {
      method: 'get',
      url: `https://explorer-api.mineplex.io/address/${wallet}`,
      headers: {}
    };

    const response = await axios.request(config);
    console.log(response.data);

    if (response.data.code && response.data.code === 5) {
      // Обработка случая, когда учетная запись не найдена
      console.log("Учетная запись не найдена:", response.data.message);
      return 0;
    } else if (response.data.coins && response.data.coins.length > 0) {
      // Обработка успешного ответа с балансом
      const mpxBalance = response.data.coins.find((coin) => coin.denom === "mpx");
      if (mpxBalance) {
        console.log('mpx есть');
        return mpxBalance.amount;
      } else {
        console.log('баланс не пустой, но mpx отсутствует');
        return 0;
      }
    } else {
      // Обработка других случаев
      console.log('Неожиданный формат ответа API:', response.data);
      return 0;
    }
  } catch (error) {
    console.error(error);
    return 0; // Обработка ошибки запроса
  }
};


const SendCoin = async (senderMnemonic, resiverWallet, coin, amount) => {
  try {
    let data = qs.stringify({
      'fromMnemonic': senderMnemonic,
      'toAddress': resiverWallet,
      'amount': amount,
      'fee': '1',
      'gas': '100000',
      'denom': coin 
    });
    
    let config = {
      method: 'post',
      url: 'https://mpxapi.bazerwallet.com/mpx/api/v1/send',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(response.data.data.txhash);
      return response.data.data.transactionHash;
    })
  } catch (error) {
    console.error(error)
  };
};

module.exports = {
  getMpxXfiTransactions,
  CheckTransactionHash,
  CheckBalance,
  SendCoin
}