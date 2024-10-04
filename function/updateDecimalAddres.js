const { Wallet } = require("dsc-js-sdk");
const WalletUserModel = require("../model/user/modelWallet");


async function getDecimalInfo(seed) {
  try {
    const decimalWallet = new Wallet(seed);
    const oldAddres = decimalWallet.wallet.address;
    const updateUserWallet = decimalWallet.wallet.evmAddress;


    console.log('oldAddres:', oldAddres);
    console.log('updateUserWallet:', updateUserWallet);

    return updateUserWallet

  } catch (error) {
  console.error(`Помилка: ${error}`);
  }
}

async function updateDecimalWallet () {
  try {
    const users = await WalletUserModel.find({});
    users.map(async (u) => {
      const updatedWallet = await getDecimalInfo(u.mnemonics);
      console.log('updatedWallet', updatedWallet);
      await WalletUserModel.updateOne( { id: u.id }, { $set: { del: { address: updatedWallet }} }).then(() => console.log('wallet updated'))
    })
  } catch (error) {
    console.error(error.message)
  }
}

module.exports = updateDecimalWallet;
