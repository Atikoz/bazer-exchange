const userManagement = require('../service/userManagement.js');

const poolDataValidation = async (userId, data, coin, comission) => {
  try {
    let userBalance = [];
    let userBalanceComissionCoin = [];
    const infoUser = await userManagement.getInfoUser(userId);
    userBalance[userId] = infoUser.userBalance.main[coin];
    userBalanceComissionCoin[userId] = infoUser.userBalance.main.cashback;

    if (isNaN(data)) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (data < 0) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (data > userBalance[userId]) {
      return { status: false, errorMessage: 'На вашем балансе не достаточно средств!' };
    }

    if (comission > userBalanceComissionCoin[userId]) {
      return { status: false, errorMessage: `На вашем балансе не достаточно средств для оплаты комиссии, она составляет ${comission} CASKBACK!` };
    }

    return { status: true }
  } catch (error) {
    console.error(error)
  }
}

module.exports = poolDataValidation;