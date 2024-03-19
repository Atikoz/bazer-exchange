const axios = require('axios');
const Decimal = require('decimal.js');
const valueToNumber = require('../helpers/valueToNumber.js');
const { Minter, TX_TYPE } = require("minter-js-sdk");

const minter = new Minter({ apiType: 'node', baseURL: 'http://api-minter.mnst.club:8843/v2/' });

class MinterTransaction {
  sendMinter = async (address, amount, seed, coin) => {
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

      return { status: true, hash: sendRequest.hash };

    } catch (error) {
      console.error(error.response.data);
      return { status: false, error: error.response.data.error.message };

    }
  };

  getCommissionTx = async (address, amount, coinId) => {
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
      const amountFee = new Decimal(feeData.commission);

      return amountFee * 1.001
    } catch (error) {
      console.error(error)
    }
  }

  checkMinterHash = async (hash) => {
    try {
      const config = {
        method: 'get',
        url: `http://api-minter.mnst.club:8843/v2/transaction/${hash}`,
        headers: {}
      };

      return axios.request(config)
        .then((response) => {
          return response.data
        });
    } catch (error) {
      console.error(error)
    }
  };

  getTransaction = async (address) => {
    try {
      const request = await axios.get(`https://explorer-api.minter.network/api/v2/addresses/${address}/transactions`);

      const arrayTx = request.data.data;

      return arrayTx
    } catch (error) {
      console.error(error)
    }
  };

  getCoinId = async (coinName) => {
    try {
      const coinId = await minter.getCoinId(coinName.toUpperCase());

      return +coinId
    } catch (error) {
      console.error(error)
    }
  };

  getRouteExchange = async (sellCoinId, buyCoinId, amount) => {
    try {
      const config = {
        method: 'get',
        url: `http://api-minter.mnst.club:8843/v2/best_trade/${sellCoinId}/${buyCoinId}/output/${amount}?max_depth=5`,
        headers: {}
      };

      const response = (await axios.request(config)).data;
      const routeExchange = response.path;

      return routeExchange
    } catch (error) {
      console.error('request error: ', error.message);
    }
  };

  getFeeExchange = async (routeArray, valueToSell) => {
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

      return +fee

    } catch (error) {
      console.error('request error: ', error.message);
      return false
    }
  };

  exchangeMinterTransaction = async (routeArray, amount, seed) => {
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

      return { status: true, data: exchange }
    } catch (error) {
      console.error(error);
      return { status: false, message: error.message }
    }
  };

  getPriceCoinInBip = async (coin) => {
    try {
      const responce = await minter.estimateCoinBuy({
        coinToBuy: coin.toUpperCase(),
        valueToBuy: 1,
        coinToSell: 'BIP',
      });

      const price = +responce.will_pay;

      return price
    } catch (error) {
      console.error(error)
    }
  };

  getBalance = async (address) => {
    const config = {
      method: 'get',
      url: `http://api-minter.mnst.club:8843/v2/address/${address}?delegated=false`,
      headers: {}
    };

    const request = await axios.request(config);
    const balanceArray = request.data.balance;

    return balanceArray
  }

};



module.exports = new MinterTransaction;