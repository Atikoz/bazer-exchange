const ProfitPoolModel = require('../../model/user/modelProfitPool.js');

const poolProfitDValidator = async (userId, amount) => {
  try {
    const userBalancePoolProfit = (await ProfitPoolModel.findOne({ id: userId })).profit;

    if (isNaN(amount)) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (amount < 0) {
      return { status: false, errorMessage: 'Введено не корректное число!' };
    };

    if (amount > userBalancePoolProfit) {
      return { status: false, errorMessage: 'На вашем балансе не достаточно средств!' };
    }

    return { status: true }
  } catch (error) {
    console.error(error)
  }
}

module.exports = poolProfitDValidator;