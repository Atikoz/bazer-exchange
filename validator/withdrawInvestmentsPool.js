const LiquidityPoolModel = require("../model/modelLiquidityPool");

const withdrawInvestmentsPoolValidator = async (firstCoin, secondCoin, coinWithdraw, amount, userId) => {
  try {
    if (isNaN(amount)) return { status: false, message: 'Введенно не коректное число.' };

    const findPool = await LiquidityPoolModel.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
    if (!findPool) return { status: false, message: 'Произошла непредвиденная ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.' }
  
    const findUser = findPool.poolUser.find(user => user.id === userId);
    if (!findUser) return { status: false, message: 'Ваша инвестиция не найдена в пуле, свяжитесь с администрацией' }
  
    if (firstCoin === coinWithdraw) {
      if (findUser.amountFirstCoin < amount) return { status: false, message: 'Невозможно вывести сумму, больше, чем ваша инвестиция в пул ликвидности.' }
    }
    else if (secondCoin === coinWithdraw) {
      if (findUser.amountSecondCoin < amount) return { status: false, message: 'Невозможно вывести сумму, больше, чем ваша инвестиция в пул ликвидности.' }
    }

    return { status: true }

  } catch (error) {
    console.error(error.message);
    return { status: false, message: 'Произошла непредвиденная ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.' }
  }
};

module.exports = withdrawInvestmentsPoolValidator;