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
      url: `https://explorer-api.mineplex.io/tx/${hash}`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(response.data);
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
      url: `https://explorer-api.mineplex.io/address/${wallet}`,
      headers: { }
    };
    
    return axios.request(config)
    .then((response) => {
      console.log(response.data);

      if (response.status === "ok" && response.data && response.data.ERROR) return 0
      
      if (response.status === "ok" && response.data && response.data.data.coins.denom[0].mpx) {
        console.log('mpx est')
        return response.data.data.coins.denom[0].mpx
      } else {
        console.log('balans ne pustoy, no mpx net');
        return 0
      }
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