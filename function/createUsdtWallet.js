const { generateAccount } = require('tron-create-address');


module.exports = async function CreateUsdtWallet () {
  const { address, privateKey } = generateAccount();

  return {
    address: address,
    privateKey: privateKey
  }
};