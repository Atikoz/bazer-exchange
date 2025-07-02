import { generateMnemonic } from "bip39";
import { Wallet } from "dsc-js-sdk";

class DecimalService {
  public createWallet() {
    try {
      const mnemonic = generateMnemonic(256);

      const decimalWalletData = new Wallet(mnemonic);
      const decimalWallet = decimalWalletData.wallet.evmAddress

      return {
        status: true,
        address: decimalWallet,
        mnemonic: mnemonic
      }
    } catch (error) {
      console.error(`error create decimal wallet: `, error);
      return {
        status: false,
        address: '',
        mnemonic: ''
      }
    }
  }

  async sendCoin(mnemonic, address, coin, amount) {
    try {
      console.log(123);

      return {
        result: {
          tx_response: {
            txhash: '123'
          }
        }
      }
    } catch (error) {
      console.error(`error create decimal wallet: `, error);
    }
  }

  async withdrawCoins(address, coin, amount) {
    try {
      console.log(123);

      return {
        result: {
          tx_response: {
            txhash: '123'
          }
        }
      }
    } catch (error) {
      console.error(`error create decimal wallet: `, error);
    }
  }
}

export default new DecimalService;