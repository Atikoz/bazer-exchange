const DoubleLiquidityPool = require("../../../model/liquidityPools/modelDoubleLiqPools");

async function SubtractCoinDualPool(firstCoin, secondCoin, buyCoin, userId, percent, amount) {
  try {
    const findPool = await DoubleLiquidityPool.findOne({
      $or: [
        { firstCoin, secondCoin },
        { firstCoin: secondCoin, secondCoin: firstCoin }
      ]
    });

    if (!findPool) {
      throw new Error('Profit pool not found');
    }

    const findUser = findPool.poolUser.find(user => user.id === userId);

    if (!findUser) {
      throw new Error('User not found in the profit pool');
    }

    const sumPool = findPool.poolUser.reduce((acc, user) => {
      acc += user.amountFirstCoin
    }, 0)


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

    firstCoin === buyCoin
      ? findUser.amountFirstCoin -= sumInvestor
      : findUser.amountSecondCoin -= sumInvestor
     
    findPool.markModified('poolUser');

    await findPool.save();
  } catch (error) {
    console.error(`error subtract coin in dual liq pool: ${error.message}`)
  }
}

module.exports = SubtractCoinDualPool