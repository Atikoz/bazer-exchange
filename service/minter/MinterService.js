const { Minter, TX_TYPE } = require("minter-js-sdk");

class MinterService {
  #minter

  constructor() {
    this.#minter = new Minter(
      {
        apiType: 'node',
        baseURL: 'https://api-minter.mnst.club/v2/'
      });
  }

  async getCoinId(coinName) {
    try {
      const coinId = await this.#minter.getCoinId(coinName.toUpperCase());
  
      return +coinId
    } catch (error) {
      console.error(`error geting minter coin id: ${error.message}`)
    }
  }

  async estimateCoinBuy() {
    try {
      const coinId = await this.#minter.estimateCoinBuy({
        coinToBuy: 'BIP',
        valueToBuy: 1,
        coinToSell: 'CASHBSC',
    })
      return coinId
    } catch (error) {
      console.error(`error estimate minter coin id: ${error.message}`)
    }
  }

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

      const sendRequest = await this.#minter.postTx(txParams, { seedPhrase: seed });

      return { status: true, hash: sendRequest.hash };
    } catch (error) {
      console.error(error);
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

      const feeData = await this.#minter.estimateTxCommission(txParams);
      const amountFee = new Decimal(feeData.commission);
      console.log(feeData)

      // return amountFee * 1.001
      return 35
    } catch (error) {
      console.error(error)
    }
  }

}

module.exports = new MinterService;