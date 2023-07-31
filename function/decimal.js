const axios = require('axios');

async function SendCoin(mnemonics, wallet, coin, amount) {
  try {
    return await axios({
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
    })
  } catch (error) {
    console.error(error)
  }
};

async function TransferCommission(mnemonics, wallet, coin, amount) {
  try {
    return await axios({
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
  } catch (error) {
    console.error(error)
  }
};

module.exports = { 
  SendCoin,
  TransferCommission,
 };
