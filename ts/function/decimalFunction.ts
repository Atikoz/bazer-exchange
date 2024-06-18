import axios from 'axios';

interface AnswerSendCoinDecimal {
  result: {
    tx_response: {
      height: string,
      txhash: string,
      // codespace: string,
      code: number,
      // data: string,
      // raw_log: string,
      // logs: [],
      // info: string,
      // gas_wanted: string,
      // gas_used: string,
      // tx: null,
      // timestamp: string,
      // events: []
    }
  }
};


interface DecimalFunction {
  SendCoinDecimal: (mnemonics: string, wallet: string, coin: string, amount: number) => Promise<AnswerSendCoinDecimal | void>,
  TransferCommissionDecimal: (mnemonics: string, wallet: string, coin: string, amount: number) => Promise<number | void>
}

const functionDecimal: DecimalFunction = {
  SendCoinDecimal: async function (mnemonics: string, wallet: string, coin: string, amount: number): Promise<AnswerSendCoinDecimal | void> {
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
  },

  TransferCommissionDecimal: async function (mnemonics: string, wallet: string, coin: string, amount: number): Promise<number | void> {
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
      console.error(error);
    }
  }
}


export default functionDecimal;
