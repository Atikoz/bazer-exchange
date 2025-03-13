const UserModel = require('../../model/user/modelUser.js');
const WalletUserModel = require('../../model/user/modelWallet.js');
const BalanceUserModel = require('../../model/user/modelBalance.js');
const CreateUsdtWallet = require('../../function/createUsdtWallet.js');
const createDecimalWallet = require('../../function/decimal/createDecimalWallet.js');
const { createUserArteryWallet } = require('../../function/createArteryWallet.js');
const ProfitPoolModel = require('../../model/user/modelProfitPool.js');
const createMinterWallet = require('../../function/createMinterWallet.js');
const crossfiService = require('../../service/crossfi/crossfiService.js');
const encryptionService = require('../../function/encryptionService.js');
const CrossfiService = new crossfiService;

async function Authentication(userId, email = null) {
  try {
    const createDelWallet = await createDecimalWallet();
    
    if (!createDelWallet.status) return this.Authentication(userId);

    const createUsdt = await CreateUsdtWallet();
    const createCrossfi = await CrossfiService.createWallet(createDelWallet.mnemonic);
    const createArtery = await createUserArteryWallet(createDelWallet.mnemonic);
    const createMinter = createMinterWallet(createDelWallet.mnemonic);

    if (!createCrossfi.status) return await CrossfiService.createWallet(createDelWallet.mnemonic);

    const encryptedMnemonic = encryptionService.encryptSeed(createDelWallet.mnemonic);
    
    await UserModel.create({
      id: userId,
      mail: email
    });

    await ProfitPoolModel.create({
      id: userId
    });

    await WalletUserModel.create({
      id: userId,
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

    await BalanceUserModel.create({
      id: userId
    });

    await sendLogs(`Пользователь ${userId} зарегестрировался в боте. Добро пожаловать!`)

    return {
      status: 'ok',
      message: 'user registered successfully',
      mnemonic: encryptedMnemonic
    };
  } catch (error) {
    console.error(error);

    return {
      status: 'error',
      message: 'error Authentication function',
      mnemonic: ''
    };
  }
}

module.exports = Authentication;