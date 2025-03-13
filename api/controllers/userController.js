const ControlUserBalance = require("../../controlFunction/userControl.js");
const userManagement = require("../../service/userManagement");
const { registerUser } = require('../../service/register/createNewAccAndRegister.js');
const encryptionService = require('../../function/encryptionService.js');
const config = require("../../config.js");
const getInfo = userManagement.getInfoUser;


const payWithBot = async (req, res) => {
  try {
    const { userId, amount, coin, p2pKey } = req.body;

    const userData = await getInfo(userId);

    if (!userData.status) {
      throw new Error('error geting info user')
    }

    const balanceUser = userData.userBalance.main;
    const encryptMemonic = userData.userWallet.mnemonic;
    const mnemonicUser = encryptionService.decryptSeed(encryptMemonic);
    const decryptedSeed = encryptionService.decryptSeed(p2pKey, config.encryptionKeyMicroservice);
    
    if (mnemonicUser !== decryptedSeed.trim()) {
      throw new Error('invalid seed phrase');
    }

    if (balanceUser[coin] < amount) {
      throw new Error('insufficient funds on balance');
    }

    await ControlUserBalance(userId, coin, -amount);

    res.status(200).json({
      status: 'ok',
      error: '',
      data: {
        user: userId,
        amountPay: amount,
        coinPay: coin
      },
      message: 'payment successful',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: 'error during payment',
      data: {},
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const result = await registerUser(userId, email);
    const message = result.message;

    const mnemonicUser = encryptionService.decryptSeed(result.mnemonic);

    if (result.status === 'error') {
      throw new Error(result.message)
    }

    const p2pKey = encryptionService.encryptSeed(mnemonicUser, config.encryptionKeyMicroservice);

    res.status(200).json({
      status: 'ok',
      error: '',
      message: message,
      data: {
        userId: userId,
        email: email,
        mnemonic: p2pKey
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Error registering user',
      message: error.message,
      data: {}
    });
  }
};

const getBalanceUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const fetchUserInfo = await getInfo(userId);

    if(!fetchUserInfo.status) {
      throw new Error('error function get info')
    }


    res.status(200).json({
      status: 'ok',
      error: '',
      data: {
        user: userId,
        balance: fetchUserInfo.userBalance.main
      },
      message: 'done',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'error get balance',
      message: error.message,
      data: {}
    });
  }
}

module.exports = {
  register,
  payWithBot,
  getBalanceUser
};
