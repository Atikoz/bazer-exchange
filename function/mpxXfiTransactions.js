const axios = require('axios');
const qs = require('qs');


const getMpxXfiTransactions = async (wallet) => {
  try {
    let config = {
      method: 'get',
      url: `https://mpxapi.bazerwallet.com/mpx/api/v1/txs?address=${wallet}&page=0`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data.data.txs
    })
  } catch (error) {
    console.error(error);
  }
};

const CheckTransactionHash = async (hash) => {
  try {
    let config = {
      method: 'get',
      url: `https://mpxapi.bazerwallet.com/mpx/api/v1/tx?tx=${hash}`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data.data.txhash
    })
  } catch (error) {
    console.error(error)
  };
};

const CheckBalance = async (wallet) => {
  try {
    let config = {
      method: 'get',
      url: `https://mpxapi.bazerwallet.com/mpx/api/v1/balance?address=${wallet}`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));

      if ('error' in response.data.ERROR) {
        return [{
          denom: "mpx",
          amount: 0
      },
      {
          denom: "xfi",
          amount: 0
      }]
      }

      return response.data.data.coins
    })
  } catch (error) {
    console.error(error)
  };
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
      console.log(JSON.stringify(response.data));
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