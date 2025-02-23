const DoubleLiquidityPool = require("../../../model/liquidityPools/modelDoubleLiqPools");

async function DistributeCoinDualPool(firstCoin, secondCoin, sellCoin, userId, percent, amount) {
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

    const onePercent = amount / 100;
    const sumInvestor = percent * onePercent;

    firstCoin === sellCoin
      ? findUser.amountFirstCoin += sumInvestor
      : findUser.amountSecondCoin += sumInvestor

    findPool.markModified('poolUser');

    await findPool.save();
  } catch (error) {
    console.error(`error distribute coin in dual liq pool: ${error.message}`)
  }
}

module.exports = DistributeCoinDualPool