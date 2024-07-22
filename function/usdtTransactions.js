const axios = require("axios");
const ethers = require("ethers");
const TronWeb = require("tronweb");
const { round } = require("mathjs");
const config = require('../config.js');


const getBalanceAddressTronNet = async (address) => {
  try {
    const options = {
      method: 'get',
      url: `https://apilist.tronscanapi.com/api/accountv2?address=${address}`,
      headers: {}
    };

    const response = await axios(options);
    const objectTron = response.data.data.tokenBalances.find(t => t.tokenAbbr === "trx");
    // const objectBazer = response.data.trc20token_balances.find(t => t.tokenAbbr === "BZR");
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
};

const getBalanceTron = async (address, privateKey, urlApi = config.urlApiTronMainnet) => {
  try {
    const HttpProvider = TronWeb.providers.HttpProvider;
    let fullNode = new HttpProvider(urlApi);
    let eventServer = new HttpProvider(urlApi);
    let solidityNode = new HttpProvider(urlApi);
    let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

    const balance = await tronWeb.trx.getBalance(address);
    return balance / 1e6;
  } catch (error) {
    console.error(error.message);
    return 0
  }
};

const TransferTronNet = async (privateKey, contract, addressTo, amount, fee = 30, urlApi = config.urlApiTronMainnet) => {
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
};

const TransferTronwebTrx = async (privateKey, addressFrom, addressTo, amount, urlApi = config.urlApiTronMainnet) => {
  const HttpProvider = TronWeb.providers.HttpProvider;
  let fullNode = new HttpProvider(urlApi);
  let eventServer = new HttpProvider(urlApi);
  let solidityNode = new HttpProvider(urlApi);
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  try {
    amount = valueToSum(amount);
    const tradeobj = await tronWeb.transactionBuilder.sendTrx(tronWeb.address.toHex(addressTo), amount, tronWeb.address.toHex(addressFrom));
    const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
    const receipt = await tronWeb.trx.sendRawTransaction(signedtxn);

    if (!receipt.result) return new Error('Непредвиденная ошибка!');

    return receipt;
  } catch (error) {
    console.error(error.message);
  }
};

const transactionTronNetworkInfo = async (hash) => {
  try {
    const options = {
      method: "GET",
      url: `https://apilist.tronscan.org/api/transaction-info?hash=${hash}`,
    };
    const getTransactionInfo = await axios(options);

    return {
      contractRet: getTransactionInfo.data.contractRet, // "SUCCESS"
      // fee: getTransactionInfo.data.cost.energy_fee / 1e6,
    };
  } catch (e) {
    console.log(e);
  }
};

const getTransaction = async (address) => {
  try {
    const getTransactionsData = [];
    const response = await axios({
      method: 'get',
      url: `https://apilist.tronscanapi.com/api/token_trc20/transfers?toAddress=${address}`,
      headers: {}
    });

    const transactions = response.data.token_transfers;
    console.log(`кошелек: `, address);
    console.log(`количество транзакций: ${transactions.length}`);
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
};

function valueToSum(value, decimals = 6) {
  value = round(value, decimals);
  value = ethers.utils.parseUnits(`${value}`, decimals);
  return value;
};

module.exports = {
  getBalanceAddressTronNet,
  getBalanceTron,
  TransferTronNet,
  TransferTronwebTrx,
  transactionTronNetworkInfo,
  getTransaction,
  valueToSum
}