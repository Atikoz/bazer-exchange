const userManagement = require('../service/userManagement.js');

const dataValidation = async (userId, data, coin) => {
  try {
    const infoUser = await userManagement.getInfoUser(userId);

    const balanceUser = infoUser.userBalance.main[coin];

    if (isNaN(data)) {
      throw new Error('Введено не корректное число!');
    }

    if (data > balanceUser) {
      throw new Error('На вашем балансе не достаточно средств!')
    }

    return { success: true };
  } catch (error) {
    return { success: false, errorMessage: error.message };
  }
};

module.exports = dataValidation;