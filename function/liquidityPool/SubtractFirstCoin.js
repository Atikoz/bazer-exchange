const LiquidityPoolModel = require("../../model/modelLiquidityPool");

const SubtractFirstCoin = async (firstCoin, secondCoin, userId, percent, amount) => {
  try {
    const findPool = await LiquidityPoolModel.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
    if (!findPool) {
      throw new Error('Profit pool not found');
    }

    const findUser = findPool.poolUser.find(user => user.id === userId);
    if (!findUser) {
      throw new Error('User not found in the profit pool');
    }

    // Проверка, что количество первой монеты после вычета не станет отрицательным
    if (findUser.amountFirstCoin < amount) {
      throw new Error('Insufficient first coin amount');
    }

    const onePercent = amount / 100;
    const sumInvestor = percent * onePercent;

    findUser.amountFirstCoin -= sumInvestor;
    findPool.markModified('poolUser');

    await findPool.save();
    
    // return { success: true, message: 'First coin subtracted successfully' };
  } catch (error) {
    console.error(error);
    // return { success: false, message: error.message };
  }
};

module.exports = SubtractFirstCoin;
