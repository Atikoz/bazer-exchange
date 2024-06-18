import axios, { AxiosResponse } from 'axios';
import ethers from "ethers";
import TronWeb from "tronweb";
import { round } from "mathjs";
import config from '../config.ts';

interface TokenBalance {
  tokenAbbr: string;
  amount: string;
  balance: number;
}

interface ApiResponseGetBalance {
  data: {
    tokenBalances: TokenBalance[];
    trc20token_balances: TokenBalance[];
  };
}

interface BalanceResult {
  balanceTron: number;
  balanceUsdt: number;
}

interface AnswerInfoTransaction {
  contractRet: string,
  fee: number
}

interface TransactionData {
  hash: string,
  coin: string,
  status: string, //OUT_OF_ENERGY //SUCCESS
  sender: string,
  amount: number,
}

interface Transaction {
  transaction_id: string;
  contractRet: string;
  from_address: string;
  quant: number;
  contract_address: string;
}

interface ApiResponseGetTransaction {
  token_transfers: Transaction[];
}

interface UsdtFunction {
  getBalanceAddressTronNet: (address: string) => Promise<BalanceResult>,
  getBalanceTron: (address: string, privateKey: string, urlApi?: string) => Promise<number>,
  TransferTronNet: (privateKey: string, contract: string, addressTo: string, amount: number, fee?: number, urlApi?: string) => Promise<string | void>,
  TransferTronwebTrx: (privateKey: string, addressFrom: string, addressTo: string, amount: number, urlApi?: string) => Promise<string | void>,
  transactionTronNetworkInfo: (hash: string) => Promise<AnswerInfoTransaction | void>,
  getTransaction: (address: string) => Promise<TransactionData[]>
}

function valueToSum(value: number, decimals: number = 6) {
  value = round(value, decimals);
  value = +ethers.utils.parseUnits(`${value}`, decimals);
  return value;
};

const usdtFun: UsdtFunction = {
  getBalanceAddressTronNet: async (address: string): Promise<BalanceResult> => {
    try {
      const options = {
        method: 'get',
        url: `https://apilist.tronscanapi.com/api/accountv2?address=${address}`,
        headers: {}
      };
  
      const response: AxiosResponse<ApiResponseGetBalance> = await axios(options);
  
      const objectTron = response.data.data.tokenBalances.find(t => t.tokenAbbr === "trx");
      const objectUsdt = response.data.data.trc20token_balances.find(t => t.tokenAbbr === "USDT");
  
      if (objectUsdt !== undefined && objectTron !== undefined) {
        return {
          balanceTron: +objectTron.amount,
          balanceUsdt: objectUsdt.balance / 1e6,
        };
      } else if (objectTron !== undefined) {
        return {
          balanceUsdt: 0,
          balanceTron: +objectTron.amount,
        };
      } else {
        return {
          balanceUsdt: 0,
          balanceTron: 0,
        };
      }
    } catch (error) {
      console.error(error.message);
      return {
        balanceUsdt: 0,
        balanceTron: 0,
      };
    }
  },

  getBalanceTron: async (address: string, privateKey: string, urlApi: string = config.urlApiTronMainnet): Promise<number> => {
    try {
      const HttpProvider = TronWeb.providers.HttpProvider;
      let fullNode = new HttpProvider(urlApi);
      let eventServer = new HttpProvider(urlApi);
      let solidityNode = new HttpProvider(urlApi);
      let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  
      const balance = await tronWeb.trx.getBalance(address);
      return balance/1e6;
    } catch (error) {
      console.error(error.message);
      return 0
    }
  },

  TransferTronNet: async (privateKey: string, contract: string, addressTo: string, amount: number, fee: number = 30, urlApi: string = config.urlApiTronMainnet): Promise<string | void> => {
    try {
      const HttpProvider = TronWeb.providers.HttpProvider;
      let fullNode = new HttpProvider(urlApi);
      let eventServer = new HttpProvider(urlApi);
      let solidityNode = new HttpProvider(urlApi);
      let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  
      if (contract == config.contractBzr) amount = amount * 1e18;
      else amount = valueToSum(amount);
      let instance = await tronWeb.contract().at(contract);
      let result = await instance.transfer(addressTo, `${amount}`).send({ feeLimit: valueToSum(fee) });
      console.log("TransferTronNetResult: ", result);
      return result;
    } catch (error) {
      console.log("TransferTronNetError: ", error.message);
    }
  },

  TransferTronwebTrx: async (privateKey: string, addressFrom: string, addressTo: string, amount: number, urlApi: string = config.urlApiTronMainnet): Promise<string | void> => {
    try {
      const HttpProvider = TronWeb.providers.HttpProvider;
      let fullNode = new HttpProvider(urlApi);
      let eventServer = new HttpProvider(urlApi);
      let solidityNode = new HttpProvider(urlApi);
      let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
      amount = valueToSum(amount);
      const tradeobj = await tronWeb.transactionBuilder.sendTrx(tronWeb.address.toHex(addressTo), amount, tronWeb.address.toHex(addressFrom));
      const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
      const receipt = await tronWeb.trx.sendRawTransaction(signedtxn);
  
      if (!receipt.result) throw new Error('Непредвиденная ошибка!');
  
      return receipt;
  
    } catch (error) {
      console.error(error.message);
    }
  },

  transactionTronNetworkInfo: async (hash: string): Promise<AnswerInfoTransaction | void> => {
    try {
      const options = {
        method: "GET",
        url: `https://apilist.tronscan.org/api/transaction-info?hash=${hash}`,
      };
      const getTransactionInfo = await axios(options);
  
      return {
        contractRet: getTransactionInfo.data.contractRet, // "SUCCESS"
        fee: getTransactionInfo.data.cost.energy_fee / 1e6,
      };
    } catch (error) {
      console.log(error.message);
    }
  },

  getTransaction: async (address: string): Promise<TransactionData[]> => {
    try {
      const getTransactionsData: TransactionData[] = [];
      const response: AxiosResponse<ApiResponseGetTransaction> = await axios({
        method: 'get',
        url: `https://apilist.tronscanapi.com/api/token_trc20/transfers?toAddress=${address}`,
        headers: { }
      });
  
      const transactions = response.data.token_transfers;
      console.log( `кошелек: `, address);
      console.log( `количество транзакций: ${transactions.length}`);
      if (transactions.length === 0) return getTransactionsData;
    
      await Promise.all(transactions.map(transaction => {
        const hash = transaction.transaction_id;
        // const amount = transaction.quant;
        const contractRet = transaction.contractRet;
        // const contractType = transaction.contract_address;
    
        // if (contractType === 1) {
        //   getTransactionsData.push({
        //     hash: hash,
        //     coin: "tron",
        //     status: contractRet, //OUT_OF_ENERGY //SUCCESS
        //     sender: transaction.from_address,
        //     amount: amount / 1e6,
        //   });
        // }
    
         
        if (transaction.contract_address === "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t") {
          getTransactionsData.push({
            hash: hash,
            coin: "usdt",
            status: contractRet, //OUT_OF_ENERGY //SUCCESS
            sender: transaction.from_address,
            amount: +transaction.quant / 1e6,
          });
        }
        else if (transaction.contract_address === "TTpfubxpeCtyqLqS3iAV8MXa2xxQG2pfNw") {
          getTransactionsData.push({
            hash: hash,
            coin: "bzr",
            status: contractRet, //OUT_OF_ENERGY //SUCCESS
            sender: transaction.from_address,
            amount: +transaction.quant / 1e18,
          });
        }
      }));
      return getTransactionsData;
    } catch (error) {
      console.error(error.message);
      return []
    };
  }
};

export default usdtFun;