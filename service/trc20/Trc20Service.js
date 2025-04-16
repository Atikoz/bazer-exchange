const TronWeb = require("tronweb");
const crypto = require("crypto");
const { generateAccount } = require("tron-create-address");
const { ITRX_API_KEY, ITRX_SECRET_KEY, urlApiTronMainnet, contractBzr, privatKeyUsdt, adminWalletUsdt } = require("../../config");
const { ethers } = require("ethers");
const { round } = require("mathjs");
const sleep = require("../../helpers/sleepFunction");

class Trc20Service {
  #apiUrl
  #apiKey
  #apiSecret
  #urlApiTronMainnet
  #HttpProvider
  #fullNode
  #eventServer
  #solidityNode
  #contractTypeUsdt
  #contractTypeBzr
  #contractTypeTron

  constructor() {
    this.#apiUrl = 'https://itrx.io';
    this.#apiKey = ITRX_API_KEY;
    this.#apiSecret = ITRX_SECRET_KEY;
    this.#urlApiTronMainnet = urlApiTronMainnet;

    this.#HttpProvider = TronWeb.providers.HttpProvider;
    this.#fullNode = new this.#HttpProvider(this.#urlApiTronMainnet);
    this.#eventServer = new this.#HttpProvider(this.#urlApiTronMainnet);
    this.#solidityNode = new this.#HttpProvider(this.#urlApiTronMainnet);

    this.#contractTypeUsdt = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    this.#contractTypeBzr = 'TTpfubxpeCtyqLqS3iAV8MXa2xxQG2pfNw';
    this.#contractTypeTron = 1;
  }

  async createWallet() {
    const { address, privateKey } = generateAccount();

    return {
      address: address,
      privateKey: privateKey
    }
  };

  async buyEnergy(walletAddress, energyAmount = 131000, duration = '1H') {
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
    const signature = crypto.createHmac('sha256', this.#apiSecret).update(message).digest('hex');

    const headers = {
      "API-KEY": this.#apiKey,
      "TIMESTAMP": timestamp,
      "SIGNATURE": signature,
      'Content-Type': 'application/json',
    };
    try {
      const response = await fetch(`${this.#apiUrl}/api/v1/frontend/order`, {
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

  async isAccountActivated(address) {
    try {
      let tronWeb = new TronWeb(this.#fullNode, this.#solidityNode, this.#eventServer);
      const account = await tronWeb.trx.getAccount(address);

      return !!account.address;
    } catch (error) {
      console.error('Error checking account activation:', error.message);
      return false;
    }
  };

  //не используется
  async ensureAccountActivated(userWallet) {
    try {
      const isActive = await this.isAccountActivated(userWallet);

      if (!isActive) {
        const sendCoin = await this.sendTrx(privatKeyUsdt, adminWalletUsdt, userWallet, 0.1);

        if (sendCoin?.result) {
          return true
        } else {
          console.error(`error sending trx for activate acc: ${error.message}`);
          return false;
        }
      }

      return true
    } catch (error) {
      console.error('error activate trc20 acc:', error.message);
      return false;
    }
  }

  async getBalance(address) {
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

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
      console.error(`error geting balance trc20 ${error.message}`);

      return {
        balanceUsdt: 0,
        balanceTron: 0,
      };
    }
  };

  async transferCoins(privateKey, contract, addressTo, amount, fee = 30) {
    try {
      let tronWeb = new TronWeb(this.#fullNode, this.#solidityNode, this.#eventServer, privateKey);

      if (contract == contractBzr) {
        amount = amount * 1e18;
      } else {
        amount = this.valueToSum(amount);
      }

      let instance = await tronWeb.contract().at(contract);
      let result = await instance.transfer(addressTo, `${amount}`).send({ feeLimit: this.valueToSum(fee), callValue: 0 });
      console.log("TransferTronNetResult: ", result);

      return result;
    } catch (error) {
      console.log("TransferTronNetError: ", error);

      return false
    }
  };

  async getTransactionEnergyInfo(txHash) {
    try {
      const tronWeb = new TronWeb(this.#fullNode, this.#solidityNode, this.#eventServer);
      const txInfo = await tronWeb.trx.getTransactionInfo(txHash);

      return {
        energyUsed: txInfo.receipt?.energy_usage_total,
        energyFee: txInfo.receipt?.energy_fee / 1e6, // TRX fee (якщо енергії не вистачило)
      };
    } catch (error) {
      console.error('error getting energy info:', error.message);
      return null;
    }
  };

  async getAccountResources(address) {
    try {
      const tronWeb = new TronWeb(this.#fullNode, this.#solidityNode, this.#eventServer);
      const resources = await tronWeb.trx.getAccountResources(address);

      console.log(resources)

      return resources;
    } catch (error) {
      console.error(`❌ Error checking energy: ${error.message}`);
      return false;
    }
  };

  async sendTrx(privateKey, addressFrom, addressTo, amount) {
    let tronWeb = new TronWeb(this.#fullNode, this.#solidityNode, this.#eventServer, privateKey);
    amount = this.valueToSum(amount);

    try {
      const tradeobj = await tronWeb.transactionBuilder.sendTrx(tronWeb.address.toHex(addressTo), amount, tronWeb.address.toHex(addressFrom));
      const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
      const receipt = await tronWeb.trx.sendRawTransaction(signedtxn);

      if (!receipt.result) return new Error('Непредвиденная ошибка!');

      console.log(receipt)

      return receipt;
    } catch (error) {
      console.error(`error transfer tron: ${error.message}`);
      return false
    }
  };

  async checkTx(hash) {
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${hash}`, requestOptions);
      const resulApi = await response.json();

      return {
        contractRet: resulApi.contractRet, // "SUCCESS"
        // fee: getTransactionInfo.data.cost.energy_fee / 1e6,
      };
    } catch (error) {
      console.error(`error check hash trc20: ${error.message}`);
    }
  };

  async getTransaction(address) {
    try {
      const getTransactionsData = [];

      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const responce = await fetch(`https://apilist.tronscanapi.com/api/token_trc20/transfers?toAddress=${address}`, requestOptions);
      const resultApi = await responce.json();

      const transactions = resultApi.token_transfers;

      console.log(`кошелек: `, address);
      console.log(`количество транзакций: ${transactions.length}`);

      if (transactions.length === 0) {
        return getTransactionsData;
      }

      await Promise.all(transactions.map(transaction => {
        const hash = transaction.transaction_id;
        const contractRet = transaction.contractRet;
        const contractType = transaction.contract_address;

        const contractMap = {
          [this.#contractTypeUsdt]: { coin: "usdt", divisor: 1e6 },
          [this.#contractTypeBzr]: { coin: "bzr", divisor: 1e18 },
          // [this.#contractTypeTron]: { coin: "tron", divisor: 1e6 }
        };

        const config = contractMap[contractType];

        if (config) {
          getTransactionsData.push({
            hash,
            coin: config.coin,
            status: contractRet,
            sender: transaction.from_address,
            amount: +transaction.quant / config.divisor,
          });
        }
      }));

      return getTransactionsData;
    } catch (error) {
      console.error(`error geting transaction trc20: ${error.message}`);

      return []
    };
  };

  async withdrawCoins(address, amount) {
    try {
      await this.buyEnergy(adminWalletUsdt);
      await sleep(15000);
      const sendCoins = await this.transferCoins(privatKeyUsdt, this.#contractTypeUsdt, address, amount);

      if (!sendCoins) {
        throw new Error('error withdraw trc20 coins')
      }

      return {
        status: true,
        hash: sendCoins
      }
    } catch (error) {
      return {
        status: false,
        hash: ''
      }
    }
  }

  valueToSum(value, decimals = 6) {
    value = round(value, decimals);
    value = ethers.utils.parseUnits(`${value}`, decimals);

    return value;
  };
}

module.exports = Trc20Service;