import axios from 'axios';

interface IExchangeComissionResponceApi {
  data: {
    result: {
      result: {
        amount: string
      }
    }
  }
}

interface IExchangeTransactionResponceApi {
  data: {
    result: {
      result: {
        tx_response: {
          code: string,
          txhash: string
        }
      }
    }
  }
}

class ExchangeCoinTransaction {
  public async exchangeComission(mnemonics: string, sellCoin: string, buyCoin: string, amountBuy: number, amountSell: number): Promise<IExchangeComissionResponceApi | void> {
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

  public async exchangeTransaction(mnemonics: string, sellCoin: string, buyCoin: string, amountBuy: number, amountSell: number): Promise<IExchangeTransactionResponceApi | void> {
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