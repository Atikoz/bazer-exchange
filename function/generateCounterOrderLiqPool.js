const circumcisionAmount = require("../helpers/circumcisionAmount");
const { getCoinRate } = require("../helpers/getCoinRate");
const LiquidityPools = require("../model/modelLiquidityPools");
const CustomOrder = require("../model/modelOrder");
const { calculateFeeTrade } = require("./calculateSpotTradeFee");

const generateCounterOrderLiqPool = async () => {
  console.log('start');
  const ordersSpotTrade = (await CustomOrder.find()).filter(order => order.status !== 'Done' && order.status !== 'Deleted');
  const liquidityPools = await LiquidityPools.find();

  const checkAmountPoolAndOrder = (amountOrder, amountPool) => {
    if (amountOrder > amountPool) {
      return { amount: amountPool, status: true }
    }
    else if (amountOrder < amountPool) {
      return { amount: amountOrder, status: false }
    }
    else if (amountOrder === amountPool) {
      return { amount: amountOrder, status: true }
    }
  };

  for (const order of ordersSpotTrade) {
    for (const pool of liquidityPools) {
      const poolMarketRate = await getCoinRate(pool.sellCoin, pool.buyCoin);
      const roundedRateClosing = 1 / poolMarketRate;
      const spreadPercentage = 1; // % разброса

      // Перевірка на співпадання пари та ринкового курсу
      if (
        order.sellCoin === pool.buyCoin &&
        order.buyCoin === pool.sellCoin &&
        order.rate >= roundedRateClosing * (1 - spreadPercentage / 100) &&
        order.rate <= roundedRateClosing * (1 + spreadPercentage / 100)
      ) {
        const ratePoolOrder = 1 / order.rate;
        const countOrder = (await CustomOrder.countDocuments()) + 1;
        const checkAmount = checkAmountPoolAndOrder(order.buyAmount, pool.amount);
        const calculationBuyAmount = circumcisionAmount(checkAmount.amount / order.rate);

        // Створення зустрічного ордеру
        await CustomOrder.create({
          id: pool.id,
          orderNumber: countOrder,
          status: 'Selling',
          sellCoin: pool.sellCoin,
          buyCoin: pool.buyCoin,
          buyAmount: calculationBuyAmount,
          sellAmount: checkAmount.amount,
          rate: ratePoolOrder,
          comission: 0,
        });

        if (checkAmount.status) {
          await LiquidityPools.deleteOne({ token: pool.token });
        } else {
          await LiquidityPools.updateOne(
            { token: pool.token },
            { $inc: { amount: -(order.buyAmount)} }
          );
        }
      }
    }
  }
};

module.exports = generateCounterOrderLiqPool;
