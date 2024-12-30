const mongoose = require('mongoose');
const config = require('../config');
const { Wallet } = require("dsc-js-sdk");
const WalletUserModel = require('../model/user/modelWallet');
const crossfiService = require("../service/crossfi/crossfiService");
const FreeAccountModel = require('../model/user/modelFreeAccount');
const { createNewAcc, registerUser } = require('../service/register/createNewAccAndRegister');
const P2PLoansOrder = require('../model/p2pLoans/modelP2POrder');
const UserModel = require('../model/user/modelUser');
const BalanceUserModel = require('../model/user/modelBalance');
const ProfitPoolModel = require('../model/user/modelProfitPool');
const createFreeAcc = require('../cron/createFeeAccount');
const createDecimalWallet = require('../function/decimal/createDecimalWallet');
const { createUserArteryWallet, createArteryManyWallet } = require('../function/createArteryWallet');
const ReplenishmentCrossfi = require('../service/crossfi/ReplenishmentService');
const createUsdtWallet = require('../function/createUsdtWallet');
const createMinterWallet = require('../function/createMinterWallet');
const encryptionService = require('../function/encryptionService');


const CrossfiService = new crossfiService;


async function updateWallet() {
  try {
    await WalletUserModel.deleteMany();
    const allUser = await UserModel.find();

    for (const user of allUser) {
      const createDelWallet = await createDecimalWallet();

      if (!createDelWallet.status) return await createNewAcc();

      const createUsdt = await createUsdtWallet();
      const createCrossfi = await CrossfiService.createWallet(createDelWallet.mnemonic);
      const createMinter = createMinterWallet(createDelWallet.mnemonic);

      if (!createCrossfi.status) return await CrossfiService.createWallet(createDelWallet.mnemonic);

      await WalletUserModel.create({
        id: user.id,
        mnemonic: createDelWallet.mnemonic,
        del: {
          address: createDelWallet.address,
        },
        usdt: {
          address: createUsdt.address,
          privateKey: createUsdt.privateKey
        },
        crossfi: {
          address: createCrossfi.address
        },
        artery: {
          address: '1',
        },
        minter: {
          address: createMinter.address,
          privateKey: createMinter.privateKey
        }
      });
    }
  } catch (error) {
    console.error(`Помилка: ${error}`);
  }
}

async function updateArteryWallet() {
  try {
    const allUser = await WalletUserModel.find();
    await createArteryManyWallet(allUser)
  } catch (error) {
    console.error(`Помилка: ${error}`);
  }
}


const createCrossfi = async () => {
  const walletDecimal = await createDecimalWallet()
  const walletCrossfi = await CrossfiService.createWallet(walletDecimal.mnemonic);

  console.log('walletDecimal', walletDecimal);
  console.log('walletCrossfi', walletCrossfi);
}

async function updatePoolProfit() {
  await ProfitPoolModel.deleteMany();
  const allUser = await UserModel.find();

  allUser.map(async (user) => {
    await ProfitPoolModel.create({
      id: +user.id
    });
  })
}

async function updateBalance() {
  const allUser = await UserModel.find();

  for (user of allUser) {
    const isUserExist = await BalanceUserModel.findOne({ id: +user.id });

    if (isUserExist) {
      continue
    }

    await BalanceUserModel.create({
      id: +user.id
    });
  }
}

function checkBalance(user) {
  let mainBalance = 0;
  let holdBalance = 0;

  const listCoin = user.main;

  for (key in listCoin) {
    mainBalance += parseFloat(user.main[key]) || 0
    holdBalance += parseFloat(user.hold[key]) || 0
  }

  if (mainBalance > 0 || holdBalance > 0) {
    return true
  } else {
    return false
  }
}

async function removeDuplicatesAndKeepNonZeroBalance() {
  const allUser = await BalanceUserModel.find();

  const userArr = [];

  allUser.map((el) => {
    const a = checkBalance(el);

    if (a) {
      userArr.push(el)
    }
  })

  console.log(userArr[0])

  await BalanceUserModel.deleteMany();

  const usersToInsert = userArr.map((user) => {
    delete user._id;
    return user;
  });

  await BalanceUserModel.insertMany(usersToInsert);
}

async function encryptMnemonic() {
  try {
    const allUser = await WalletUserModel.find();

    for (user of allUser) {
      const encryptedSeed = encryptionService.encryptSeed(user.mnemonic);

      await WalletUserModel.updateOne(
        { mnemonic: user.mnemonic },
        { $set: { mnemonic: encryptedSeed } }
      )
    }
  } catch (error) {
    console.error(error)
  }
}

(async () => {
  await mongoose.connect(config.dataBaseUrl)
    .then(console.log('Mongo connected'))
    .catch((error) => console.error('error connnect mongo:', error));

  // await updatePoolProfit()
  // await removeDuplicatesAndKeepNonZeroBalance()
  // await updateBalance()
  // await updateWallet()
  // await updateArteryWallet()
  // await encryptMnemonic()
  await createNewAcc()
})();