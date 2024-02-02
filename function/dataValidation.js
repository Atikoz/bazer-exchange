const userManagement = require('../service/userManagement.js');

const dataValidation = async (userId, data, coin) => {
  try {
    const infoUser = await userManagement.getInfoUser(userId);

    let userBalance = [];
    userBalance[userId] = infoUser.userBalance.main[coin];

    if (isNaN(data)) {
      return { success: false, errorMessage: 'Введено не корректное число!' };
    }

    if (data > userBalance[userId]) {
      console.log('balance: ', userBalance[userId], coin);
      return { success: false, errorMessage: 'На вашем балансе не достаточно средств!' };
    }

    return { success: true };
  } catch (error) {
    console.error(error)
  }
};

module.exports = dataValidation;