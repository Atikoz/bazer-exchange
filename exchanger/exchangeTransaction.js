const axios = require('axios');

class ExchangeCoinTransaction {
  async exchangeComission(mnemonic, sellCoin, buyCoin, amountBuy, amountSell) {
    try {
      return await axios({
        method: 'POST',
        url: `https://cryptoapi7.ru/api/v1/buyCoin`,
        data: JSON.stringify({
          "mnemonics": `${mnemonic}`,
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
            "simulate": true
          },
          "payload": {
            "denomSell": `${sellCoin}`,
            "denomBuy": `${buyCoin}`,
            "amountBuy": `${amountBuy}`,
            "amountSell": `${amountSell}`
          }
        })
      });
    } catch (error) {
      console.error(error)
    }
  }

  async exchangeTransaction(mnemonics, sellCoin, buyCoin, amountBuy, amountSell) {
    try {
      return await axios({
        method: 'POST',
        url: `https://cryptoapi7.ru/api/v1/buyCoin`,
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
            "simulate": false
          },
          "payload": {
            "denomSell": `${sellCoin}`,
            "denomBuy": `${buyCoin}`,
            "amountBuy": `${amountBuy}`,
            "amountSell": `${amountSell}`
          }
        })
      });
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = new ExchangeCoinTransaction