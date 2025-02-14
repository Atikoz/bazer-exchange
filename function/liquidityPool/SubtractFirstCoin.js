const SingleLiquidityPool = require("../../model/liquidityPools/modelSingleLiquidityPool");

const SubtractFirstCoin = async (firstCoin, secondCoin, userId, percent, amount) => {
  try {
    console.log('firstCoin:', firstCoin);
    console.log('secondCoin:', secondCoin);
    console.log('userId:', userId);
    console.log('percent:', percent);
    console.log('amount:', amount);

    const findPool = await SingleLiquidityPool.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
    if (!findPool) {
      throw new Error('Profit pool not found');
    }

    const findUser = findPool.poolUser.find(user => user.id === userId);
    if (!findUser) {
      throw new Error('User not found in the profit pool');
    }

    let sumPool = 0;

    findPool.poolUser.forEach(element => {
      sumPool += element.amountFirstCoin
    });


    // Проверка, что количество первой монеты после вычета не станет отрицательным
    if (sumPool < amount) {
      throw new Error('Insufficient first coin amount');
    }

    const onePercent = amount / 100;
    const sumInvestor = percent * onePercent;

    // Проверка, что количество первой монеты у пользователя после вычета не станет отрицательным
    if (findUser.amountFirstCoin < sumInvestor) {
      throw new Error('Insufficient first coin amount in user');
    }

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
