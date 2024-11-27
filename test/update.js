const mongoose = require('mongoose');
const config = require('../config');
const { Wallet } = require("dsc-js-sdk");
const WalletUserModel = require('../model/user/modelWallet');
const crossfiService = require("../function/crossfi/crossfiService");
const FreeAccountModel = require('../model/user/modelFreeAccount');
const { createNewAcc, registerUser } = require('../service/register/createNewAccAndRegister');
const P2PLoansOrder = require('../model/p2pLoans/modelP2POrder');
const UserModel = require('../model/user/modelUser');
const BalanceUserModel = require('../model/user/modelBalance');
const ProfitPoolModel = require('../model/user/modelProfitPool');
const createFreeAcc = require('../cron/createFeeAccount');

mongoose.connect(config.dataBaseUrl);


async function updateDecimalWallet(seed) {
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

const updateDb = async () => {
  try {
    const result = await FreeAccountModel.deleteMany();

    console.log(result);
  } catch (error) {
    console.error(error)
  }
}

const updateName = async () => {
  try {
    const result = await FreeAccountModel.updateMany(
      {},
      { $rename: { mpxXfi: 'crossfi' } } // Перейменовує поле
    );

    console.log(`Documents mpxXfi updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error(error)
  }
}

const updateWallet = async () => {
  try {
    const allAcc = await FreeAccountModel.find();
    const allUser = await WalletUserModel.find();

    for (const user of allUser) {
      const mnemonic = user.mnemonic;
      console.log('mnemonic', mnemonic);
      const wallet = await crossfiService.createWallet(mnemonic);

      if (!wallet.status) return

      await WalletUserModel.updateOne(
        { id: user.id },
        { $set: { crossfi: { address: wallet.address } } }
      )
    }

    // for (const user of allAcc) {
    //   const mnemonic = user.mnemonic;
    //   console.log('mnemonic', mnemonic);
    //   const wallet = await updateDecimalWallet(mnemonic);

    //   const walletCrossfi = await crossfiService.createWallet(mnemonic);

    //   if (!walletCrossfi.status) return

    //   await FreeAccountModel.updateOne(
    //     { mnemonic: user.mnemonic },
    //     {
    //       $set: {
    //         crossfi: {
    //           address: walletCrossfi.address
    //         },
    //         del: {
    //           address: wallet
    //         }
    //       }
    //     }
    //   )
    // }

  } catch (error) {
    console.error(error)
  }
}

const update = async () => {
  try {
    // await createNewAcc()
    // await createNewAcc()
    // await createNewAcc()

    const freeAcc = await FreeAccountModel.find();
    console.log('free acc', freeAcc);
    
    const id = 7122942360;

    const user = await UserModel.find({ id: id });
    const balance = await BalanceUserModel.find({ id: id })
    const wallet = await WalletUserModel.find({ id: id });
    const poolProfit = await ProfitPoolModel.find({ id: id });

    console.log('user', user);
    console.log('balance', balance);
    console.log('wallet', wallet);
    console.log('poolProfit', poolProfit);

    // await registerUser(999)


  } catch (error) {
    console.error(error)
  }
}


(async () => {
  // await updateDb();
  // await updateName();
  // await updateWallet();
  await update()
  await mongoose.connection.close();
})();