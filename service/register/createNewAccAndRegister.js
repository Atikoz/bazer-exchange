const Authentication = require('./auth.js');
const UserModel = require('../../model/user/modelUser.js');
const WalletUserModel = require('../../model/user/modelWallet.js');
const BalanceUserModel = require('../../model/user/modelBalance.js');
const CreateUsdtWallet = require('../../function/createUsdtWallet.js');
const createDecimalWallet = require('../../function/createDecimalWallet.js');
const CreateMinePlexWallet = require('../../function/createMinePlexWallet.js');
const createMpxXfiWallet = require('../../function/createMpxXfiWallet.js');
const { createUserArteryWallet } = require('../../function/createArteryWallet.js');
const ProfitPoolModel = require('../../model/user/modelProfitPool.js');
const createMinterWallet = require('../../function/createMinterWallet.js');
const FreeAccountModel = require('../../model/user/modelFreeAccount.js');

const createNewAcc = async () => {
  try {
    const createDelWallet = await createDecimalWallet();
    const createUsdt = await CreateUsdtWallet();
    const createMinePlex = await CreateMinePlexWallet(createDelWallet.del.mnemonic);
    const createMpxXfi = await createMpxXfiWallet(createDelWallet.del.mnemonic);
    const createArtery = await createUserArteryWallet(createDelWallet.del.mnemonic);
    const createMinter = createMinterWallet(createDelWallet.del.mnemonic)
    if (createDelWallet.status != 'ok') return await createNewAcc();

    await FreeAccountModel.create( {
      busy: false,
      mnemonic: createDelWallet.del.mnemonic,
      del: {
        address: createDelWallet.del.address,
      },
      usdt: {
        address: createUsdt.address,
        privateKey: createUsdt.privateKey
      },
      minePlex: {
        address: createMinePlex.data.keys.pkh,
        sk: createMinePlex.data.keys.sk,
        pk: createMinePlex.data.keys.pk
      },
      mpxXfi: {
        address: createMpxXfi.data.account.address
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
        mnemonic: walletUser.mnemonics
      };
    }

    // Якщо немає вільних акаунтів, робимо "аварійну" реєстрацію
    if (!freeAccount) {
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
      status: 0,
      mail: email,
      lang: 'eng'
    });

    await ProfitPoolModel.create({
      id: userId,
      profit: 0
    });

    await WalletUserModel.create({
      id: userId,
      mnemonics: freeAccount.mnemonic,
      del: {
        address: freeAccount.del.address,
      },
      usdt: {
        address: freeAccount.usdt.address,
        privateKey: freeAccount.usdt.privateKey
      },
      minePlex: {
        address: freeAccount.minePlex.pkh,
        sk: freeAccount.minePlex.sk,
        pk: freeAccount.minePlex.pk
      },
      mpxXfi: {
        address: freeAccount.mpxXfi.address
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
      id: userId,
      main: {
        usdt: 0,
        mine: 0,
        plex: 0,
        mpx: 0,
        xfi: 0,
        artery: 0,
        bip: 0,
        hub: 0,
        monsterhub: 0,
        bnb: 0,
        usdtbsc: 0,
        bipkakaxa: 0,
        cashbsc: 0,
        minterBazercoin: 0,
        ruble: 0,
        bazerhub: 0,
        cashback: 0,
        del: 0,
        ddao: 0,
        delkakaxa: 0,
        converter: 0,
        pro: 0,
        dar: 0,
        sbt: 0,
        reboot: 0,
        makarovsky: 0,
        btt: 0,
        dixwell: 0,
        avt: 0,
        kharat: 0,
        byacademy: 0,
        patrick: 0,
        itcoin: 0,
        messege: 0,
        rrunion: 0,
        vegvisir: 0,
        fbworld: 0,
        dcschool: 0,
        comcoin: 0,
        mintcandy: 0,
        sirius: 0,
        cgttoken: 0,
        genesis: 0,
        taxicoin: 0,
        prosmm: 0,
        sharafi: 0,
        safecoin: 0,
        dtradecoin: 0,
        izicoin: 0,
        gzacademy: 0,
        workout: 0,
        zaruba: 0,
        magnetar: 0,
        candypop: 0,
        randomx: 0,
        ekology: 0,
        emelyanov: 0,
        belymag: 0,
        doorhan: 0,
        lakshmi: 0,
        ryabinin: 0,
        related: 0,
        monopoly: 0,
        baroncoin: 0,
        nashidela: 0,
        irmacoin: 0,
        maritime: 0,
        business: 0,
        randice: 0,
        alleluia: 0,
        hosanna: 0,
        cbgrewards: 0,
        novoselka: 0,
        monkeyclub: 0,
        grandpay: 0,
        magnate: 0,
        crypton: 0,
        iloveyou: 0,
        bazercoin: 0,
        bazerusd: 0,
      },
      hold: {
        usdt: 0,
        mine: 0,
        plex: 0,
        mpx: 0,
        xfi: 0,
        artery: 0,
        bip: 0,
        hub: 0,
        monsterhub: 0,
        bnb: 0,
        usdtbsc: 0,
        bipkakaxa: 0,
        cashbsc: 0,
        minterBazercoin: 0,
        ruble: 0,
        bazerhub: 0,
        cashback: 0,
        del: 0,
        ddao: 0,
        delkakaxa: 0,
        converter: 0,
        pro: 0,
        dar: 0,
        sbt: 0,
        reboot: 0,
        makarovsky: 0,
        btt: 0,
        dixwell: 0,
        avt: 0,
        kharat: 0,
        byacademy: 0,
        patrick: 0,
        itcoin: 0,
        messege: 0,
        rrunion: 0,
        vegvisir: 0,
        fbworld: 0,
        dcschool: 0,
        comcoin: 0,
        mintcandy: 0,
        sirius: 0,
        cgttoken: 0,
        genesis: 0,
        taxicoin: 0,
        prosmm: 0,
        sharafi: 0,
        safecoin: 0,
        dtradecoin: 0,
        izicoin: 0,
        gzacademy: 0,
        workout: 0,
        zaruba: 0,
        magnetar: 0,
        candypop: 0,
        randomx: 0,
        ekology: 0,
        emelyanov: 0,
        belymag: 0,
        doorhan: 0,
        lakshmi: 0,
        ryabinin: 0,
        related: 0,
        monopoly: 0,
        baroncoin: 0,
        nashidela: 0,
        irmacoin: 0,
        maritime: 0,
        business: 0,
        randice: 0,
        alleluia: 0,
        hosanna: 0,
        cbgrewards: 0,
        novoselka: 0,
        monkeyclub: 0,
        grandpay: 0,
        magnate: 0,
        crypton: 0,
        iloveyou: 0,
        bazercoin: 0,
        bazerusd: 0
      }
    });

    await FreeAccountModel.deleteOne({ mnemonic: freeAccount.mnemonic });

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