const Authentication = require('./auth.js');
const UserModel = require('../../model/user/modelUser.js');
const WalletUserModel = require('../../model/user/modelWallet.js');
const BalanceUserModel = require('../../model/user/modelBalance.js');
const createDecimalWallet = require('../../function/decimal/createDecimalWallet.js');
const { createUserArteryWallet } = require('../../function/createArteryWallet.js');
const ProfitPoolModel = require('../../model/user/modelProfitPool.js');
const createMinterWallet = require('../../function/createMinterWallet.js');
const FreeAccountModel = require('../../model/user/modelFreeAccount.js');
const crossfiService = require('../../service/crossfi/crossfiService.js');
const encryptionService = require('../../function/encryptionService.js');
const sendLogs = require('../../helpers/sendLog.js');
const Trc20Service = require('../trc20/Trc20Service.js');
const CrossfiService = new crossfiService();
const Trc20 = new Trc20Service();

const createNewAcc = async () => {
  try {
    const createDelWallet = await createDecimalWallet();

    if (!createDelWallet.status) return await createNewAcc();

    const createUsdt = await Trc20.createWallet();
    const createCrossfi = await CrossfiService.createWallet(createDelWallet.mnemonic);
    const createArtery = await createUserArteryWallet(createDelWallet.mnemonic);
    const createMinter = createMinterWallet(createDelWallet.mnemonic);

    if (!createCrossfi.status) return await CrossfiService.createWallet(createDelWallet.mnemonic);

    const encryptedMnemonic = encryptionService.encryptSeed(createDelWallet.mnemonic);

    await FreeAccountModel.create({
      busy: false,
      mnemonic: encryptedMnemonic,
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
        address: createArtery
      },
      minter: {
        address: createMinter.address,
        privateKey: createMinter.privateKey
      }
    });
    
    return true
  } catch (error) {
    console.error(error);

    return false;
  }
}

const registerUser = async (userId, email = null) => {
  try {
    const [existingUser, freeAccount] = await Promise.all([
      UserModel.findOne({ id: userId }).lean(),
      FreeAccountModel.findOne({ busy: false }).lean()
    ]);

    // Якщо користувач знайдений, повертаємо дані про нього
    if (existingUser) {
      const walletUser = await WalletUserModel.findOne({ id: userId }).lean();

      return {
        status: 'ok',
        message: 'user registered',
        mnemonic: walletUser.mnemonic
      };
    }

    // Якщо немає вільних акаунтів, робимо "аварійну" реєстрацію
    if (!freeAccount) {
      console.log('karau')
      const emergencyRegistration = await Authentication(userId, email);

      return emergencyRegistration;
    }

    // Вибираємо вільний акаунт та позначаємо його як зайнятий
    await FreeAccountModel.updateOne(
      { mnemonic: freeAccount.mnemonic },
      { busy: true }
    );

    await UserModel.create({
      id: userId,
      mail: email
    });

    await ProfitPoolModel.create({
      id: userId
    });

    await WalletUserModel.create({
      id: userId,
      mnemonic: freeAccount.mnemonic,
      del: {
        address: freeAccount.del.address,
      },
      usdt: {
        address: freeAccount.usdt.address,
        privateKey: freeAccount.usdt.privateKey
      },
      crossfi: {
        address: freeAccount.crossfi.address
      },
      artery: {
        address: freeAccount.artery.address
      },
      minter: {
        address: freeAccount.minter.address,
        privateKey: freeAccount.minter.privateKey
      }
    });

    await BalanceUserModel.create({
      id: userId
    });

    await FreeAccountModel.deleteOne({ mnemonic: freeAccount.mnemonic });

    await sendLogs(`Пользователь ${userId} зарегестрировался в боте. Добро пожаловать!`)

    return {
      status: 'ok',
      message: 'user registered successfully',
      mnemonic: freeAccount.mnemonic
    };
  } catch (error) {
    console.error(error);

    return {
      status: 'error',
      message: 'error register function',
      mnemonic: ''
    };
  }
}

module.exports = {
  createNewAcc,
  registerUser
}