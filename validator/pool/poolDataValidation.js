const { commissionCoin } = require('../../function/calculateSpotTradeFee.js');
const userManagement = require('../../service/userManagement.js');

const poolDataValidation = async (userId, data, coin, comission) => {
  try {
    let userBalance = [];
    const infoUser = await userManagement.getInfoUser(userId);
    userBalance[userId] = infoUser.userBalance.main[coin];
    const balanceComissionCoin = infoUser.userBalance.main[commissionCoin];

    if (isNaN(data)) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (isNaN(comission)) {
      return { status: false, errorMessage: 'Произошла непредвиденная ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.' };
    };

    if (data < 0) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (data > userBalance[userId]) {
      return { status: false, errorMessage: `На вашем балансе не достаточно средств для создания резерва! Доступно: ${userBalance[userId]} ${coin.toUpperCase()}.` };
    }

    if (comission > balanceComissionCoin) {
      return { status: false, errorMessage: `На вашем балансе не достаточно средств для оплаты комиссии! Необходимо ${comission} ${commissionCoin}. Доступно: ${balanceComissionCoin} ${commissionCoin}.` };
    }

    return { status: true }
  } catch (error) {
    console.error(error)
  }
}

module.exports = poolDataValidation;