const { walletFromMnemonic } = require('minterjs-wallet');

const createMinterWallet = (mnemonic) => {
try {
  const wallet = walletFromMnemonic(mnemonic);

  const privateKeyBuffer = wallet._privKey;

  const privateKeyHex = privateKeyBuffer.toString('hex');

  const address = wallet.getAddressString();

  return {
    address: address,
    privateKey: privateKeyHex,
  }
  } catch (error) {
  console.error(error)
}
};

module.exports = createMinterWallet;