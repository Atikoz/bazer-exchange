import TronWeb from 'tronweb';
import crypto from 'crypto';
import { generateAccount } from 'tron-create-address';
import { ethers } from 'ethers';
import { round } from 'mathjs';
import { AccountResourcesTrc20, CheckTransactionTrc20, CreateWalletTrc20, TransactionEnergyInfoTrc20, TransactionItemTrc20, UserBalanceTrc20, WithdrawCoinsTrc20 } from '../../../interface/Trc20Interfces';
import sleep from '../../../function/sleepFunction';

const ADMIN_WALLET_TRC20 = process.env.ADMIN_WALLET_TRC20;
const ADMIN_PRIVATE_KEY_TRC20 = process.env.ADMIN_PRIVATE_KEY_TRC20;
const ITRX_API_KEY = process.env.ITRX_API_KEY;
const ITRX_SECRET_KEY = process.env.ITRX_SECRET_KEY;
const URL_API_TRON_MAINNET = process.env.URL_API_TRON_MAINNET;
const CONTRACT_TYPE_USDT_TRC20 = process.env.CONTRACT_TYPE_USDT_TRC20;
const CONTRACT_TYPE_BAZER_TRC20 = process.env.CONTRACT_TYPE_BAZER_TRC20;
const CONTRACT_TYPE_TRON = process.env.CONTRACT_TYPE_TRON;


class Trc20Service {
  protected readonly adminWalletUsdt = ADMIN_WALLET_TRC20;
  protected readonly privatKeyUsdt = ADMIN_PRIVATE_KEY_TRC20;
  private readonly apiUrl = 'https://itrx.io';
  private readonly apiKey = ITRX_API_KEY;
  private readonly apiSecret = ITRX_SECRET_KEY;
  private readonly urlApi = URL_API_TRON_MAINNET;
  private readonly HttpProvider = TronWeb.providers.HttpProvider;
  private readonly fullNode = new this.HttpProvider(this.urlApi);
  private readonly eventServer = new this.HttpProvider(this.urlApi);
  private readonly solidityNode = new this.HttpProvider(this.urlApi);
  protected readonly contractTypeUsdt = CONTRACT_TYPE_USDT_TRC20;
  protected readonly contractTypeBzr = CONTRACT_TYPE_BAZER_TRC20;
  private readonly contractTypeTron = CONTRACT_TYPE_TRON;

  async createWallet(): Promise<CreateWalletTrc20> {
    const { address, privateKey } = generateAccount();

    return {
      address: address,
      privateKey: privateKey
    }
  };

  protected async buyEnergy(walletAddress: string, energyAmount: number = 131000, duration: string = '1H'): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const data = {
      energy_amount: energyAmount,
      period: duration,
      receive_address: walletAddress,
      callback_url: 'https://mydomain.com/callback',
      out_trade_no: '123456',
    };

    const json_data = JSON.stringify(data, Object.keys(data).sort());
    const message = `${timestamp}&${json_data}`;
    const signature = crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');

    const headers = {
      "API-KEY": this.apiKey,
      "TIMESTAMP": timestamp,
      "SIGNATURE": signature,
      'Content-Type': 'application/json',
    };
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/frontend/order`, {
        method: 'POST',
        headers: headers,
        body: json_data
      });

      const data = await response.json();

      if (response.ok && !data.errno) {
        console.log('✅ Energy successfully purchased');
        return data;
      } else {
        console.error('❌ Error when buying energy:', data);
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❗ Request to itrx.io failed:', error.message);
      throw error;
    }
  };

  //не используется
  protected async isAccountActivated(address: string): Promise<boolean> {
    try {
      let tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer);
      const account = await tronWeb.trx.getAccount(address);

      return !!account.address;
    } catch (error) {
      console.error('Error checking account activation:', error.message);
      return false;
    }
  };

  protected async ensureAccountActivated(userWallet: string): Promise<boolean> {
    try {
      const isActive = await this.isAccountActivated(userWallet);

      if (!isActive) {
        const sendCoin = await this.sendTrx(this.privatKeyUsdt, this.adminWalletUsdt, userWallet, 0.1);

        if (sendCoin?.result) {
          return true
        } else {
          throw new Error(`error sending trx for activate acc: ${sendCoin}`)
        }
      }
    } catch (error) {
      console.error('error activate trc20 acc:', error.message);
      return false;
    }
  }

  async getBalance(address: string): Promise<UserBalanceTrc20> {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };
    try {
      const response = await fetch(`https://apilist.tronscanapi.com/api/accountv2?address=${address}`, requestOptions);
      const resultApi = await response.json();

      const objectTron = resultApi.withPriceTokens.find(t => t.tokenAbbr === "trx");
      // const objectBazer = resultApi.withPriceTokens.find(t => t.tokenAbbr === "BZR");
      const objectUsdt = resultApi.withPriceTokens.find(t => t.tokenAbbr === "USDT");

      return {
        balanceTron: objectTron ? +objectTron.amount : 0,
        balanceUsdt: objectUsdt ? objectUsdt.balance / 1e6 : 0
      }
    } catch (error) {
      console.error(`error geting balance trc20 `, error);

      return {
        balanceUsdt: 0,
        balanceTron: 0,
      };
    }
  };

  protected async transferCoins(privateKey: string, contract: string, addressTo: string, amount: number, fee: number = 30): Promise<string | false> {
    try {
      const tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, privateKey);
      const finalAmount = contract === this.contractTypeBzr ? amount * 1e18 : this.valueToSum(amount);
      const instance = await tronWeb.contract().at(contract);
      const result = await instance.transfer(addressTo, `${finalAmount}`).send({ feeLimit: this.valueToSum(fee), callValue: 0 });
      console.log("TransferTronNetResult: ", result);

      return result;
    } catch (error) {
      console.log("TransferTronNetError: ", error);

      return false
    }
  };

  protected async getTransactionEnergyInfo(txHash: string): Promise<TransactionEnergyInfoTrc20> {
    try {
      const tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer);
      const txInfo = await tronWeb.trx.getTransactionInfo(txHash);

      if (!txInfo.receipt) {
        throw new Error(`Receipt not found in transaction info: ${txInfo}`);
      }

      return {
        status: true,
        energyUsed: txInfo.receipt?.energy_usage_total,
        energyFee: txInfo.receipt?.energy_fee / 1e6, // TRX fee (якщо енергії не вистачило)
      };
    } catch (error) {
      console.error('error getting energy info:', error.message);

      return {
        status: false,
        energyUsed: 0,
        energyFee: 0
      };
    }
  };

  protected async getAccountResources(address: string): Promise<AccountResourcesTrc20 | null> {
    const tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer);
    const resources = await tronWeb.trx.getAccountResources(address);

    console.log(resources)

    return resources;
  };

  protected async sendTrx(privateKey: string, addressFrom: string, addressTo: string, amount: number) {
    try {
      const tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, privateKey);
      const value = this.valueToSum(amount);
      
      const tx = await tronWeb.transactionBuilder.sendTrx(tronWeb.address.toHex(addressTo), value, tronWeb.address.toHex(addressFrom));
      const signed = await tronWeb.trx.sign(tx, privateKey);
      const receipt = await tronWeb.trx.sendRawTransaction(signed);
  
      return receipt.result ? receipt : null;
    } catch (error) {
      console.error(`error transfer tron: `, error);
      throw error
    }
  };

  protected async checkTx(hash: string): Promise<CheckTransactionTrc20> {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

      try {
      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${hash}`, requestOptions);
      const resulApi = await response.json();

      return {
        status: resulApi.contractRet, // "SUCCESS"
        // fee: getTransactionInfo.data.cost.energy_fee / 1e6,
      };
    } catch (error) {
      console.error(`error check hash trc20: ${error.message}`);
      throw error
    }
  };

  protected async getTransaction(address: string): Promise<TransactionItemTrc20[]> {
      const transactionsArray: TransactionItemTrc20[] = [];

      const requestOptions: RequestInit = {
        method: "GET",
        redirect: "follow" as RequestRedirect
      };

      try {
      const responce = await fetch(`https://apilist.tronscanapi.com/api/token_trc20/transfers?toAddress=${address}`, requestOptions);
      const resultApi = await responce.json();

      const transactions = resultApi.token_transfers;

      console.log(`кошелек: `, address);
      console.log(`количество транзакций: ${transactions.length}`);

      const contractMap: Record<string, { coin: string; divisor: number }> = {
        [this.contractTypeUsdt]: { coin: "usdt", divisor: 1e6 },
        [this.contractTypeBzr]: { coin: "bzr", divisor: 1e18 },
        // [this.contractTypeTron]: { coin: "tron", divisor: 1e6 }
      };

      for (const tx of transactions) {
        const config = contractMap[tx.contract_address];
        if (config) {
          transactionsArray.push({
            hash: tx.transaction_id,
            coin: config.coin,
            status: tx.contractRet,
            sender: tx.from_address,
            amount: +tx.quant / config.divisor,
          });
        }
      }

      return transactionsArray;
    } catch (error) {
      console.error(`error geting transaction trc20: `, error);

      return []
    };
  };

  async withdrawCoins(address: string, amount: number): Promise<WithdrawCoinsTrc20> {
    try {
      await this.buyEnergy(this.adminWalletUsdt);
      await sleep(15000);
      const sendCoins = await this.transferCoins(this.privatKeyUsdt, this.contractTypeUsdt, address, amount);

      if (!sendCoins) {
        throw new Error('error withdraw trc20 coins')
      }

      return {
        status: true,
        hash: sendCoins
      }
    } catch (error) {
      console.log(`error withdraw trc20 coins: `, error);

      return {
        status: false,
        hash: ''
      }
    }
  }

  protected valueToSum(value: number, decimals = 6): string {
    const rounded = round(value, decimals);
    return ethers.utils.parseUnits(`${rounded}`, decimals).toString();
  }
}

export default Trc20Service;