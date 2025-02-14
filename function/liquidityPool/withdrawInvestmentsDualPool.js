const DoubleLiquidityPool = require("../../model/liquidityPools/modelDoubleLiqPools");

const withdrawInvestmentsDualPool = async (firstCoin, secondCoin, withdrawCoin, userId, amount) => {
  try {
    const findPool = await DoubleLiquidityPool.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
    
    if (!findPool) {
      throw new Error('Profit pool not found');
    }

    const findUser = findPool.poolUser.find(user => user.id === userId);
    if (!findUser) {
      throw new Error('User not found in the profit pool');
    }

    if (withdrawCoin === firstCoin) {
      // Проверка, что количество первой монеты после вычета не станет отрицательным
      if (findUser.amountFirstCoin < amount) {
        throw new Error('Insufficient first coin amount');
      }

      findUser.amountFirstCoin -= amount;
    }
    else if (withdrawCoin === secondCoin) {
      if (findUser.amountSecondCoin < amount) {
        throw new Error('Insufficient second coin amount');
      }

      findUser.amountSecondCoin -= amount;
    }

    // Метод markModified() указывает Mongoose, что поле было изменено
    findPool.markModified('poolUser');
    await findPool.save();

    return { status: true };
  } catch (error) {
    console.error(error);
    return { status: false, message: error.message };
  }
};

module.exports = withdrawInvestmentsDualPool;
