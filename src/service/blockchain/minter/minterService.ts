import Big from "big.js";
import { Minter, TX_TYPE } from "minter-js-sdk";
import { ICreateMinterWallet, IExchangeMinter, ISendMinter, ItemBalanceMinter, ITxDataMinter, MinterTransaction } from "../../../interface/MinterInterface";
import { toBaseUnit } from "../../../utils/unitConversion";
import { walletFromMnemonic } from 'minterjs-wallet'

const MINTER_NODE_URL = process.env.MINTER_NODE_URL;
const MNEMONIC = process.env.MNEMONIC;

class MinterService {
  private readonly minter: Minter;
  private readonly nodeUrl: string;

  constructor() {
    this.minter = new Minter(
      {
        apiType: 'node',
        baseURL: 'https://api-minter.mnst.club/v2/'
      });

    this.nodeUrl = MINTER_NODE_URL;
  }

  async createMinterWallet(mnemonic: string): Promise<ICreateMinterWallet> {
    const wallet = walletFromMnemonic(mnemonic);

    const privateKeyBuffer = wallet._privKey;

    const privateKeyHex = privateKeyBuffer.toString('hex');

    const address = wallet.getAddressString();

    return {
      address: address,
      privateKey: privateKeyHex,
    }
  };

  async getCoinId(coinName: string): Promise<number> {
    const coinId = await this.minter.getCoinId(coinName.toUpperCase());

    return +coinId
  }

  protected async estimateCoinBuy() {
    try {
      const coinId = await this.minter.estimateCoinBuy({
        coinToBuy: 'BIP',
        valueToBuy: 1,
        coinToSell: 'CASHBSC',
      })
      return coinId
    } catch (error) {
      console.error(`error estimate minter coin id: `, error)
    }
  }

  sendMinter = async (address: string, amount: number, seed: string, coin: string): Promise<ISendMinter> => {
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

      const sendRequest = await this.minter.postTx(txParams, { seedPhrase: seed });

      return {
        status: true,
        hash: sendRequest.hash,
        error: null
      };
    } catch (error) {
      console.error(`error sending minter coins: `, error);

      return {
        status: false,
        hash: '',
        error: error.response.data.error.message
      };
    }
  };

  async withdrawCoins(address: string, amount: number, coin: string): Promise<string | null> {
    try {
      const result = await this.sendMinter(address, amount, MNEMONIC, coin);

      if (!result.status) {
        throw new Error(result.error)
      }

      return result.hash
    } catch (error) {
      throw error
    }
  };

  protected getCommissionTx = async (address: string, amount: number, coinId: number): Promise<number> => {
    const txParams = {
      type: TX_TYPE.SEND,
      data: {
        to: `${address}`,
        value: `${amount}`,
        coin: coinId
      }
    };

    const feeData = await this.minter.estimateTxCommission(txParams);
    const formatted = new Big(feeData.commission).toFixed(2);

    return +formatted + 3
  };

  protected checkMinterHash = async (hash: string): Promise<ITxDataMinter> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch(`${this.nodeUrl}/v2/transaction/${hash}`, requestOptions);
    const resultApi = await response.json();

    return resultApi
  };

  protected getTransaction = async (address: string): Promise<MinterTransaction[]> => {
    if (!address) {
      return []
    }

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    try {
      const request = await fetch(`https://explorer-api.minter.network/api/v2/addresses/${address}/transactions`, requestOptions);
      const resultApi = await request.json();
      const arrayTx = resultApi.data;

      return arrayTx
    } catch (error) {
      console.error('get transaction minter', error.message);
      return []
    }
  };

  getRouteExchange = async (sellCoinId: number, buyCoinId: number, amount: number): Promise<string[]> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch(`${this.nodeUrl}/v2/best_trade/${sellCoinId}/${buyCoinId}/output/${amount}?max_depth=5`, requestOptions);
    const resultApi = await response.json();

    const routeExchange = resultApi.path;

    return routeExchange
  };

  getFeeExchange = async (routeArray: number[], valueToSell: number): Promise<number> => {
    const amount = toBaseUnit(valueToSell);
    const firstElement = 0;
    const lastElement = routeArray.length - 1;
    let url = `${this.nodeUrl}/v2/estimate_coin_sell?coin_id_to_buy=${routeArray[lastElement]}&coin_id_to_sell=${routeArray[firstElement]}&value_to_sell=${amount}&coin_id_commission=0&swap_from=pool`;

    if (routeArray.length > 2) {
      for (let i = 1; i < routeArray.length - 1; i++) {
        url += `&route=${routeArray[i]}`;
      }
    };

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const responce = await fetch(url, requestOptions);
    const resultApi = await responce.json();

    const fee = ((resultApi.commission / 1e18) * 1.001).toFixed(2);

    return +fee
  };

  exchangeMinterTransaction = async (routeArray: string[], amount: number, seed: string): Promise<IExchangeMinter> => {
    const txParams = {
      type: TX_TYPE.SELL_SWAP_POOL,
      data: {
        coins: routeArray, // route of coin IDs from spent to received
        valueToSell: amount,
        minimumValueToBuy: 0, // optional, 0 by default
      },
    };

    try {
      const exchange = await this.minter.postTx(txParams, { seedPhrase: seed });

      return {
        status: true,
        data: exchange
      }
    } catch (error) {
      console.error(`error exchange minter coins: `, error);

      return {
        status: false,
        message: error.message
      }
    }
  };

  getBalance = async (address: string): Promise<ItemBalanceMinter[]> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const responce = await fetch(`${this.nodeUrl}/v2/address/${address}?delegated=false`, requestOptions);
    const resultApi = await responce.json();

    const balanceArray = resultApi.balance;

    return balanceArray
  };
}

export default MinterService;