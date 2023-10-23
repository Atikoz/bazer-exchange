const axios = require ("axios");
const ethers = require ("ethers");
const TronWeb = require ("tronweb");
const { round } = require ("mathjs");
const config = require('../config.js');


const getBalanceAddressTronNet = async (address) => {
  try {
    const options = {
      method: 'get',
      url: `https://tron.p2p.bazerwallet.com/tron-client/api/v1/getBalance?address=${address}`,
      headers: { }
    };
  
    const response = await axios(options);
    const objectTron = response.data.data.tokenBalances.find(t => t.tokenAbbr === "trx");
    // const objectBazer = response.data.trc20token_balances.find(t => t.tokenAbbr === "BZR");
    const objectUsdt = response.data.data.trc20token_balances.find(t => t.tokenAbbr === "USDT");
  
    if (objectUsdt != undefined) return {
        balanceTron: Number(objectTron.amount),
        balanceUsdt: objectUsdt.balance / 1e6,
    }
    return {
      balanceUsdt: 0,
      balanceTron: Number(objectTron.amount),
    };
  } catch (error) {
    console.error(error)
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
    return balance/1e6;
  } catch (error) {
    console.error(error)
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
    else amount = valueToSun(amount);
    let instance = await tronWeb.contract().at(contract);
    let result = await instance.transfer(addressTo, `${amount}`).send({ feeLimit: valueToSun(fee) });
    console.log("TransferTronNetResult: ", result);
    return result;
  } catch (e) {
    console.log("TransferTronNetError: ", e);
  }
};

const TransferTronwebTrx = async (privateKey, addressFrom, addressTo, amount, urlApi = config.urlApiTronMainnet) => {
  const HttpProvider = TronWeb.providers.HttpProvider;
  let fullNode = new HttpProvider(urlApi);
  let eventServer = new HttpProvider(urlApi);
  let solidityNode = new HttpProvider(urlApi);
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  try {
    amount = valueToSun(amount);
    const tradeobj = await tronWeb.transactionBuilder.sendTrx(tronWeb.address.toHex(addressTo), amount, tronWeb.address.toHex(addressFrom));
    const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
    const receipt = await tronWeb.trx.sendRawTransaction(signedtxn);
    if (!receipt.result)
      return new Error('Непредвиденная ошибка!');
    return receipt;
  } catch (error) {
    return new Error(error);
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
      url: `https://tron.p2p.bazerwallet.com/tron-client/api/v1/getTransfers?address=${address}&limit=50&start=0`,
      headers: { }
    });

    const transactions = response.data.data.token_transfers;
    // console.log( `кошелек: `, address);
    // console.log( `количество транзакций: ${transactions.length}`);
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
  
       
      if (transaction.trigger_info.contract_address === "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t") {
        getTransactionsData.push({
          hash: hash,
          coin: "usdt",
          status: contractRet, //OUT_OF_ENERGY //SUCCESS
          sender: transaction.from_address,
          amount: Number(transaction.trigger_info.parameter._value / 1e6),
        });
      }
      else if (transaction.trigger_info.contract_address === "TTpfubxpeCtyqLqS3iAV8MXa2xxQG2pfNw") {
        getTransactionsData.push({
          hash: hash,
          coin: "bzr",
          status: contractRet, //OUT_OF_ENERGY //SUCCESS
          sender: transaction.from_address,
          amount: Number(transaction.trigger_info.parameter._value / 1e18),
        });
      }
    }));
    return getTransactionsData;
  } catch (error) {
    console.error(error)
  };
};

function valueToSun(value, decimals = 6) {
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
  valueToSun
}