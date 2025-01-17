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

}

module.exports = new MinterService;