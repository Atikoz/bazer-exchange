import axios from 'axios';
import qs from 'qs';

interface UserTransaction {
  operationHash: string,
  destination: string,
  source: string
  amount: string
  type: string
}

interface CheckHashData {
  total: number;
  data: { operationHash: string }[];
}


interface ResultSendCoin {
  transaction: {
    hash: string
  }
}

interface SendRequestData {
  sk: string;
  operations: {
    to: string;
    amount: number;
    fee: number;
    type: string;
  }[];
}

interface MinePlexFunction {
  getMinePlexTransactions: (wallet: string) => Promise<UserTransaction[] | void>,
  checkHashSendAdminComission: (hash: string) => Promise<string | boolean>,
  checkBalance: (wallet: string) => Promise<number | string>,
  sendCoin: (senderKey: string, recipientAddress: string, amount: number, coin: string) => Promise<ResultSendCoin | void>
}

const minePlex: MinePlexFunction = {
  getMinePlexTransactions: async function (wallet: string): Promise<UserTransaction[] | void> {
    try {
      const userTransactionMinePlex = await axios({
        method: 'get',
        url: `https://explorer.mineplex.io/api/transactions?$limit=1000&$skip=0&$sort[blockLevel]=-1&$sort[counter]=-1&$or[0][source]=${wallet}&$or[1][destination]=${wallet}&type[]=plex&type[]=mine`,
        headers: {}
      });

      return userTransactionMinePlex.data.data

    } catch (error) {
      console.error(error);
    }
  },
  checkHashSendAdminComission: async function (hash: string): Promise<string | boolean> {
    try {
      const chekHash = await axios({
        method: 'get',
        url: `https://explorer.mineplex.io/api/transactions?operationHash=${hash}`,
        headers: {}
      });

      const transactionData: CheckHashData = chekHash.data;

      if (!transactionData.total) {
        const operationHash = transactionData.data[0].operationHash;
        return operationHash;
      } else {
        return false
      }
    } catch (error) {
      console.error(error);
      return false
    }
  },
  checkBalance: async function (wallet: string): Promise<number | string> {
    try {
      const data = qs.stringify({
        'pkh': `${wallet}`
      });

      const answer = await axios({
        method: 'post',
        url: 'https://mineplexapi.bazerwallet.com/mineplex/api/v1/balance',
        headers: {},
        data: data
      });

      if (answer.data.status === 'ok') {
        return +answer.data.data.balance[1].mine
      } else {
        return 'error'
      }
    } catch (error) {
      console.error(error);
      return 'error'
    }
  },
  sendCoin: async function (senderKey: string, recipientAddress: string, amount: number, coin: string): Promise<ResultSendCoin | void> {
  try {
    const requestData: SendRequestData = {
      sk: senderKey,
      operations: [
        { to: recipientAddress, amount: amount, fee: 1, type: coin }
      ]
    };

    const sendRequest = await axios({
      method: 'post',
      url: 'https://mineplexapi.bazerwallet.com/mineplex/api/v1/sendOperation',
      headers: {},
      data: requestData
    });

    if (sendRequest.data.data.error) return

    return sendRequest.data.data

  } catch (error) {
    console.error(error);
    return
  }
  }
}

export default minePlex;




