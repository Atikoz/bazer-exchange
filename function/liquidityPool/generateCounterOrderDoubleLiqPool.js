const { getCoinRate } = require("../../helpers/getCoinRate.js");
const PoolProfitManagement = require("../../controlFunction/poolProfitManagement.js");
const sendLogs = require("../../helpers/sendLog.js");
const { sendMessage } = require("../../helpers/tgFunction.js");
const BalanceUserModel = require("../../model/user/modelBalance.js");
const CustomOrder = require("../../model/modelOrder.js");
const CalculateFee = require("../calculateSpotTradeFee.js");
const PercentInvestor = require("./percentInvestor.js");
const ProfitInvestor = require("./ProfitInvestor.js");
const DoubleLiquidityPool = require("../../model/liquidityPools/modelDoubleLiqPools.js");
const DistributeCoinDualPool = require("./doubleLiqPool/DistributeCoinDualPool.js");
const SubtractCoinDualPool = require("./doubleLiqPool/SubtractCoinDualPool.js");


const generateCounterOrderDoubleLiqPool = async () => {
  try {
    const allOrder = await CustomOrder.find();
    const filtredOrdersSpotTrade = allOrder.filter(order => order.status !== 'Done' && order.status !== 'Deleted');

    for (const order of filtredOrdersSpotTrade) {
      const pool = await DoubleLiquidityPool.findOne({
        $or: [
          { firstCoin: order.sellCoin, secondCoin: order.buyCoin },
          { firstCoin: order.buyCoin, secondCoin: order.sellCoin }
        ]
      });

      if (!pool) {
        continue
      }

      const poolMarketRate = await getCoinRate(order.sellCoin, order.buyCoin);

      if (!poolMarketRate) {
        continue
      };

      const spreadPercentage = 5; // % разброса
      const lowerBound = poolMarketRate * (1 - spreadPercentage / 100);
      const upperBound = poolMarketRate * (1 + spreadPercentage / 100);

      const logMessage = [];

      if (order.rate >= lowerBound && order.rate <= upperBound) {
        const sumPool = pool.poolUser.reduce((acc, user) => {
          acc[pool.firstCoin] += user.amountFirstCoin;
          acc[pool.secondCoin] += user.amountSecondCoin;

          return acc
        }, { [pool.firstCoin]: 0, [pool.secondCoin]: 0 });

        if (sumPool[order.buyCoin] <= 0) {
          continue
        }

        if (sumPool[order.buyCoin] >= order.buyAmount) {
          const profitAdmin = (order.comission / 100) * 15;
          const profitInvestors = order.comission - profitAdmin;
          await PoolProfitManagement(1511153147, profitAdmin);
          logMessage.push(`Пользователю 1511153147 начислено вознаграждение c пула в размере ${profitAdmin} ${CalculateFee.commissionCoin.toUpperCase()},`);
          sendMessage(1511153147, `Вам начислено вознаграждение c пула в размере ${profitAdmin} ${CalculateFee.commissionCoin.toUpperCase()}`)

          for (const user of pool.poolUser) {
            const investorPercent = order.buyCoin === pool.firstCoin
              ? PercentInvestor(sumPool[order.buyCoin], user.amountFirstCoin)
              : PercentInvestor(sumPool[order.buyCoin], user.amountSecondCoin)

            const investorProfit = ProfitInvestor(investorPercent, profitInvestors);
            await PoolProfitManagement(user.id, investorProfit);

            logMessage.push(` Пользователю ${user.id} начислено вознаграждение c пула в размере ${investorProfit} ${CalculateFee.commissionCoin.toUpperCase()},`);
            sendMessage(user.id, `Вам начислено вознаграждение c пула в размере ${investorProfit} ${CalculateFee.commissionCoin.toUpperCase()}`)


            await SubtractCoinDualPool(pool.firstCoin, pool.secondCoin, order.buyCoin, user.id, investorPercent, order.buyAmount);
            await DistributeCoinDualPool(pool.firstCoin, pool.secondCoin, order.sellCoin, user.id, investorPercent, order.sellAmount);
          }

          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "hold.${order.sellCoin}": -${order.sellAmount} } }`)
          );

          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "main.${order.buyCoin}": ${order.buyAmount} } }`)
          );

          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "hold.${CalculateFee.commissionCoin}": -${order.comission} } }`)
          );

          await CustomOrder.updateOne(
            { id: order.id, orderNumber: order.orderNumber },
            { $set: { status: 'Done' } }
          )

          sendMessage(order.id, `Ордер №${order.orderNumber} был выполнен ✅.`);
          sendLogs(`Ордер №${order.orderNumber} был выполнен ✅.`);
          sendLogs(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`);
          sendLogs(logMessage.join('\n'));
        } else {
          const buySum = sumPool[order.buyCoin];
          const sellSum = buySum / order.rate;
          const feeTrade = CalculateFee.calculateFeeTrade(sellSum, buySum, order.comission, order.sellAmount, order.buyAmount);

          const profitAdmin = (feeTrade / 100) * 15;
          const profitInvestors = feeTrade - profitAdmin;

          await PoolProfitManagement(1511153147, profitAdmin);
          logMessage.push(`Пользователю 1511153147 начислено вознаграждение c пула в размере ${profitAdmin} ${CalculateFee.commissionCoin.toUpperCase()},`);
          sendMessage(1511153147, `Вам начислено вознаграждение c пула в размере ${profitAdmin} ${CalculateFee.commissionCoin.toUpperCase()}`)

          for (const user of pool.poolUser) {

            const investorPercent = order.buyCoin === pool.firstCoin
              ? PercentInvestor(sumPool[order.buyCoin], user.amountFirstCoin)
              : PercentInvestor(sumPool[order.buyCoin], user.amountSecondCoin)

            const investorProfit = ProfitInvestor(investorPercent, profitInvestors);

            await PoolProfitManagement(user.id, investorProfit);
            logMessage.push(`Пользователю ${user.id} начислено ${investorProfit} ${CalculateFee.commissionCoin} за вознаграждение в пуле,`);
            sendMessage(user.id, `Вам начислено ${investorProfit} ${CalculateFee.commissionCoin} за вознаграждение в пуле`)

            await SubtractCoinDualPool(pool.firstCoin, pool.secondCoin, order.buyCoin, user.id, investorPercent, buySum);
            await DistributeCoinDualPool(pool.firstCoin, pool.secondCoin, order.sellCoin, user.id, investorPercent, sellSum);
          }

          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "hold.${order.sellCoin}": -${sellSum} } }`)
          );

          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "main.${order.buyCoin}": ${buySum} } }`)
          );

          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "hold.${CalculateFee.commissionCoin}": -${feeTrade} } }`)
          );

          await CustomOrder.updateOne(
            { id: order.id, orderNumber: order.orderNumber },
            { $inc: { buyAmount: -buySum, sellAmount: -sellSum, comission: -feeTrade } }
          );

          sendMessage(order.id, `По ордеру №${order.orderNumber} была выполнена торговля.`);
          sendLogs(`По ордеру №${order.orderNumber} была выполнена торговля.`);
          sendLogs(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`);
          sendLogs(logMessage.join('\n'));
        }
      }

    }
  } catch (error) {
    console.log('-----------------')
    console.error(`error generate counter order double liq pool: ${error.message}`);
    console.error(error);
    console.log('-----------------')

  }
}

module.exports = generateCounterOrderDoubleLiqPool;