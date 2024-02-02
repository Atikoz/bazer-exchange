const userManagement = require('../service/userManagement.js');

const poolDataValidation = async (userId, data, coin) => {
  try {
    let userBalance = [];
    const infoUser = await userManagement.getInfoUser(userId);
    userBalance[userId] = infoUser.userBalance.main[coin];

    if (isNaN(data)) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (data < 0) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (data > userBalance[userId]) {
      return { status: false, errorMessage: 'На вашем балансе не достаточно средств!' };
    }

    return { status: true }
  } catch (error) {
    console.error(error)
  }
}

module.exports = poolDataValidation;