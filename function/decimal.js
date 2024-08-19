const axios = require('axios');

async function SendCoin(mnemonics, wallet, coin, amount) {
  try {
    const request = await axios({
      method: 'POST',
      url: `https://cryptoapi7.ru/api/v1/sendCoins`,
      data: JSON.stringify({
        "mnemonics": `${mnemonics}`,
        "transaction": {
          "network": "mainnet",
          "isNodeDirectMode": false,
          "options": {
            "customNodeEndpoint": {
              "nodeRestUrl": "http://127.0.0.1:1317",
              "rpcEndpoint": "http://127.0.0.1:26657",
              "web3Node": "http://127.0.0.1:12289"
            }
          }
        },
        "options": {
          "simulate": false,
          "feeCoin": `${coin}`
        },
        "payload": {
          "recipient": `${wallet}`,
          "denom": `${coin}`,
          "amount": `${amount}`,
        }
      })
    });

    const data = request.data.result;

    return data
  } catch (error) {
    console.error(error)
  }
};

async function TransferCommission(mnemonics, wallet, coin, amount) {
  try {
    if (coin === 'cashback') return 15
    const responce = await axios({
      method: 'POST',
      url: `https://cryptoapi7.ru/api/v1/sendCoins`,
      data: JSON.stringify({
        "mnemonics": `${mnemonics}`,
        "transaction": {
          "network": "mainnet",
          "isNodeDirectMode": false,
          "options": {
            "customNodeEndpoint": {
              "nodeRestUrl": "http://127.0.0.1:1317",
              "rpcEndpoint": "http://127.0.0.1:26657",
              "web3Node": "http://127.0.0.1:12289"
            }
          }
        },
        "options": {
          "simulate": true,
          "feeCoin": `${coin}`
        },
        "payload": {
          "recipient": `${wallet}`,
          "denom": `${coin}`,
          "amount": `${amount}`,
        }
      })
    })

    const commission = responce.data.result.result.amount / 1e18;

    return commission
  } catch (error) {
    console.error(error)
  }
};

async function getUserTx(adress) {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://mainnet-explorer-api.decimalchain.com/api/address/${adress}/txs?limit=10&offset=0`,
      headers: {},
      timeout: 60000
    };

    const resultApi = await axios.request(config);

    return resultApi.data.result
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else {
      console.error('An error occurred:', error.message);
    }
  }
}

module.exports = {
  SendCoin,
  TransferCommission,
  getUserTx
};
