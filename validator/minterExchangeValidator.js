const userManagement = require('../service/userManagement.js');

const exchangeValidator = async (userId, amount, sellCoin, feeAmount) => {
  try {
    const infoUser = await userManagement.getInfoUser(userId);
    const userBalance = infoUser.userBalance.main[sellCoin];
    const balanceFeeCoin = infoUser.userBalance.main.bip;

    if (isNaN(amount)) return { status: false, errorMessage: 'Введено не корректное число!' };

    if (isNaN(feeAmount)) return { status: false, errorMessage: 'Комиссия расчиталась не корректно!' };

    if (feeAmount > balanceFeeCoin) return { status: false, errorMessage: `На балансе не достаточно средств для оплаты комиссии, для оплаты требуется ${feeAmount} BIP!` }

    if (userBalance < amount) return { status: false, errorMessage: 'На балансе не достаточно средств для обмена!' }

    return { status: true }

  } catch (error) {
    console.error(error)
  }
};

module.exports = exchangeValidator;