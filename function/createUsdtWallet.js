const { generateAccount } = require('tron-create-address');


module.exports = async function CreateUsdtWallet () {
  const { address, privateKey } = generateAccount();

  console.log(address, privateKey);
  return {
    address: address, 
    privateKey: privateKey
  }
};