const mongoose = require('mongoose');
const config = require('../config');
const WalletUserModel = require('../model/user/modelWallet');
const crossfiService = require("../function/crossfi/crossfiService");

mongoose.connect(config.dataBaseUrl);


const updateDb = async () => {
  try {
    const result = await WalletUserModel.updateMany(
      {},
      { $unset: { minePlex: "" } }
    );

    console.log(`Documents minePlex updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error(error)
  }
}

const updateName = async () => {
  try {
    const result = await WalletUserModel.updateMany(
      {},
      { $rename: { mpxXfi: 'crossfi' } } // Перейменовує поле
    );
    
    const result1 = await WalletUserModel.updateMany(
      {},
      { $rename: { mnemonics: 'mnemonic' } } // Перейменовує поле
    );

    console.log(`Documents mpxXfi updated: ${result.modifiedCount}`);
    console.log(`Documents mnemonics updated: ${result1.modifiedCount}`);
  } catch (error) {
    console.error(error)
  }
}

const updateWallet = async () => {
  try {
    const allUser = await WalletUserModel.find();

    for (const user of allUser) {
      const mnemonic = user.mnemonic;
      console.log('mnemonic', mnemonic);
      const wallet = await crossfiService.createWallet(mnemonic);

      if (!wallet.status) return

      await WalletUserModel.updateOne(
        {id: user.id},
        {$set: { crossfi: wallet.address }}
      )
    }

  } catch (error) {
    console.error(error)
  }
}

(async () => {
  await updateDb();
  await updateName();
  // await updateWallet();
  await mongoose.connection.close();
})();