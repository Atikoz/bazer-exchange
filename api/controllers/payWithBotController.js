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
    res.status(500).json({
      status: 'error',
      error: 'error during payment',
      data: {},
      message: error.message,
    });
  }
};


module.exports = { payWithBot };