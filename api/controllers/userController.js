const { encrypt } = require('../../helpers/encryptionFunction.js');
const AuthenticationService = require('../../service/auth.js');
const { ControlUserBalance } = require("../../helpers/userControl");
const userManagement = require("../../service/userManagement");
const getInfo = userManagement.getInfoUser;


const payWithBot = async (req, res) => {
  try {
    const { userId, amount, coin, mnemonic } = req.body;
    const balanceUser = (await getInfo(userId)).userBalance.main;
    const mnemonicUser = ((await getInfo(userId)).userWallet.mnemonics);

    if (mnemonicUser !== mnemonic.trim()) throw new Error('invalid seed phrase');

    if (balanceUser[coin] < amount) throw new Error('insufficient funds on balance');

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
    const result = await AuthenticationService.Authentication(userId, email);
    const message = result.message

    if (result.status === 'error') throw new Error(result.message)

    res.status(200).json({
      status: 'ok',
      error: '',
      message: message,
      data: {
        userId: userId,
        email: email,
        mnemonic: encrypt(result.mnemonic)
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
    const { userId, mnemonic } = req.body;
    const balanceUser = (await getInfo(userId)).userBalance.main;
    const mnemonicUser = ((await getInfo(userId)).userWallet.mnemonics);

    if (mnemonicUser !== mnemonic.trim()) throw new Error('invalid seed phrase');

    res.status(200).json({
      status: 'ok',
      error: '',
      data: {
        user: userId,
        balance: balanceUser
      },
      message: 'done',
    });
  } catch (error) {
    res.status(400).json({
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
