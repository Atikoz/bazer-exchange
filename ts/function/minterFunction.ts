import axios from 'axios'
import valueToNumber from '../helpers/valueToNumber.ts';
import { Minter, TX_TYPE } from "minter-js-sdk";

const minter = new Minter({ apiType: 'node', baseURL: 'http://api-minter.mnst.club:8843/v2/' });

interface StatusTransaction {
  status: boolean,
  hash: string,
  error: string
}

interface StatusGetCoinId {
  status: boolean,
  id: number
}

interface CodeHash {
  code: string
}

interface TransactionElement {
  hash: string;
  data: {
    coin: { 
      id: number,
      symbol: string;
    };
    to: string;
    value: number;
  }
}

interface StatusGetTransaction {
  status: boolean,
  tx: TransactionElement[] | []
}

interface Coin {
  id: string;
  symbol: string;
}

interface Balance {
  coin: Coin;
  value: string;
  bip_value: string;
}

interface ApiResponseGetBalance {
  balance: Balance[];
}

interface StatusGetBalance {
  status: boolean,
  arrayBalance: ApiResponseGetBalance | []
}

interface StatusGetRoute {
  status: boolean,
  route: string[] | []
}

interface StatusGetFeeExchange {
  status: boolean,
  fee: number
}

interface DataExchangeMinter {
  hash: string
}

interface StatusExchangeMinter {
  status: boolean, 
  data: DataExchangeMinter | string
  message: string
}

class MinterTransaction {
  public async sendMinter(address: string, amount: number, seed: string, coin: string): Promise<StatusTransaction> {
    try {
      const coinId = await this.getCoinId(coin);
      const txParams = {
        type: TX_TYPE.SEND,
        data: {
          to: `${address}`,
          value: `${amount}`,
          coin: coinId, // coin id
        }
      };

      const sendRequest = await minter.postTx(txParams, { seedPhrase: seed });

      return { status: true, hash: sendRequest.hash, error: '' };
    } catch (error) {
      // console.error(error)
      return { status: false, hash: '', error: error.response.data.error.message };
    }
  };

  public getCoinId = async (coinName: string): Promise<StatusGetCoinId> => {
    try {
      const coinId = await minter.getCoinId(coinName.toUpperCase());

      return { status: true, id: +coinId }
    } catch (error) {
      console.error(error);
      return { status: false, id: 0 }
    }
  };

  public getCommissionTx = async (address: string, amount: number, coinId: number): Promise<number> => {
    try {
      const txParams = {
        type: TX_TYPE.SEND,
        data: {
          to: `${address}`,
          value: `${amount}`,
          coin: coinId
        }
      };

      const feeData = await minter.estimateTxCommission(txParams);
      const amountFee = +feeData.commission;

      // return amountFee * 1.001
      return 35
    } catch (error) {
      console.error(error);
      return 35
    }
  };

  public checkMinterHash = async (hash: string): Promise<CodeHash> => {
    try {
      const config = {
        method: 'get',
        url: `http://api-minter.mnst.club:8843/v2/transaction/${hash}`,
        headers: {}
      };
      const response = await axios.request(config);

      return response.data;
    } catch (error) {
      console.error(error);
      return { code: '1' };
    }
  };

  public getTransaction = async (address: string): Promise<StatusGetTransaction> => {
    try {
      const request = await axios.get(`https://explorer-api.minter.network/api/v2/addresses/${address}/transactions`);

      const arrayTx = request.data.data;

      return { status: true, tx: arrayTx }
    } catch (error) {
      console.error(error);
      return { status: true, tx: [] }
    }
  };

  public getRouteExchange = async (sellCoinId: number, buyCoinId: number, amount: number): Promise<StatusGetRoute> => {
    try {
      const config = {
        method: 'get',
        url: `http://api-minter.mnst.club:8843/v2/best_trade/${sellCoinId}/${buyCoinId}/output/${amount}?max_depth=5`,
        headers: {}
      };

      const response = (await axios.request(config)).data;
      const routeExchange = response.path;

      return { status: true, route: routeExchange }
    } catch (error) {
      console.error('request error: ', error.message);
      return { status: false, route: [] }
    }
  };

  public getFeeExchange = async (routeArray: string[], valueToSell: string): Promise<StatusGetFeeExchange> => {
    try {
      const amount = valueToNumber(valueToSell);
      const firstElement = 0;
      const lastElement = routeArray.length - 1;
      let url = `http://api-minter.mnst.club:8843/v2/estimate_coin_sell?coin_id_to_buy=${routeArray[lastElement]}&coin_id_to_sell=${routeArray[firstElement]}&value_to_sell=${amount}&coin_id_commission=0&swap_from=pool`;

      if (routeArray.length > 2) {
        for (let i = 1; i < routeArray.length - 1; i++) {
          url += `&route=${routeArray[i]}`;
        }
      };

      const config = {
        method: 'get',
        url: url,
        headers: {}
      };

      const responce = (await axios.request(config)).data;
      const fee = ((responce.commission / 1e18) * 1.001).toFixed(2);

      return { status: true, fee: +fee }

    } catch (error) {
      console.error('request error: ', error.message);
      return { status: false, fee: 0 }
    }
  };

  public getBalance = async (address: string): Promise<StatusGetBalance> => {
    try {
      const config = {
        method: 'get',
        url: `http://api-minter.mnst.club:8843/v2/address/${address}?delegated=false`,
        headers: {}
      };
  
      const request = await axios.request(config);
      const balanceArray = request.data.balance;
  
      return { status: false, arrayBalance: balanceArray }
    } catch (error) {
      console.error(error);
      return { status: false, arrayBalance: [] }
    }
  };

  public exchangeMinterTransaction = async (routeArray: string[], amount: number, seed: string): Promise<StatusExchangeMinter> => {
    try {
      const txParams = {
        type: TX_TYPE.SELL_SWAP_POOL,
        data: {
          coins: routeArray, // route of coin IDs from spent to received
          valueToSell: amount,
          minimumValueToBuy: 0, // optional, 0 by default
        },
      };

      const exchange = await minter.postTx(txParams, { seedPhrase: seed });

      return { status: true, data: exchange, message: '' }
    } catch (error) {
      console.error(error);
      return { status: false, data: '', message: error.message }
    }
  };
};

export default new MinterTransaction;
