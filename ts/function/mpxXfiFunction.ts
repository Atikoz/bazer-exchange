import axios from "axios";
import qs from 'qs';

interface MessageAmount {
  denom: string;
  amount: string;
}

interface MessageBody {
  messages: Array<{
    from_address: string;
    to_address: string;
    amount: MessageAmount[];
  }>;
}

interface Transaction {
  body: MessageBody;
}

interface TransactionsMpxXfi {
  txhash: string;
  tx: Transaction;
}

interface MpxXfiFunctions {
  getTransactions: (wallet: string) => Promise<TransactionsMpxXfi[]>,
  checkTransactionHash: (hash: string) => Promise<string | void>,
  checkBalance: (wallet: string) => Promise<number>,
  sendCoin: (senderMnemonic: string, resiverWallet: string, coin: string, amount: string | number) => Promise<string | void>,
}

const mpxXfi: MpxXfiFunctions = {
  getTransactions: async function (wallet: string): Promise<TransactionsMpxXfi[]> {
    try {
      const config = {
        method: 'get',
        url: `https://explorer-api.mineplex.io/txs?address=${wallet}&page=0`,
        headers: {}
      };
  
      const response = await axios.request(config);
      if (response.data) {
        return response.data.txs;
      } else {
        return []
      }
    } catch (error) {
      console.error(error);
      return []
    }
  },
  
  checkTransactionHash: async function (hash: string): Promise<string | void> {
    try {
      const config = {
        method: 'get',
        url: `https://explorer-api.mineplex.io/tx/${hash}`,
        headers: {}
      };
  
      const response = await axios.request(config);
      console.log(response.data);
      return response.data.txhash;
    } catch (error) {
      console.error(error);
    }
  },
  
  checkBalance: async function (wallet: string): Promise<number> {
    try {
      const config = {
        method: 'get',
        url: `https://explorer-api.mineplex.io/address/${wallet}`,
        headers: {}
      };
  
      const response = await axios.request(config);
      const responseData = response.data;
  
      console.log(responseData);
  
      if (responseData.code && responseData.code === 5) {
        // Обработка случая, когда учетная запись не найдена
        console.log("Учетная запись не найдена:", responseData.message);
        return 0;
      } else if (responseData.coins && responseData.coins.length > 0) {
        // Обработка успешного ответа с балансом
        const mpxBalance = responseData.coins.find((coin) => coin.denom === "mpx");
        if (mpxBalance) {
          console.log('mpx есть');
          return mpxBalance.amount;
        } else {
          console.log('баланс не пустой, но mpx отсутствует');
          return 0;
        }
      } else {
        // Обработка других случаев
        console.log('Неожиданный формат ответа API:', responseData);
        return 0;
      }
    } catch (error) {
      console.error(error);
      return 0; // Обработка ошибки запроса
    }
  },
  
  sendCoin: async function (senderMnemonic: string, resiverWallet: string, coin: string, amount: string | number): Promise<string | void> {
    try {
      const data = qs.stringify({
        'fromMnemonic': senderMnemonic,
        'toAddress': resiverWallet,
        'amount': amount,
        'fee': '1',
        'gas': '100000',
        'denom': coin
      });
      
      const config = {
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
  }
}
export default mpxXfi;




