const { Wallet } = require("dsc-js-sdk");
const bip39 = require("bip39");

async function createDecimalWallet() {
  try {
    const mnemonic = bip39.generateMnemonic(256);

    const decimalWalletData = new Wallet(mnemonic);
    const decimalWallet = decimalWalletData.wallet.evmAddress

    return {
      status: true,
      address: decimalWallet,
      mnemonic: mnemonic
    }
  } catch (error) {
    console.error(error.message);
    return {
      status: false,
      address: '',
      mnemonic: ''
    }
  }
}

module.exports = createDecimalWallet;