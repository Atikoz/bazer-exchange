const { getCoinRate } = require("../../helpers/getCoinRate");
const PoolProfitManagement = require("../../helpers/poolProfitManagement");
const sendLogs = require("../../helpers/sendLog.js");
const sendMessage = require("../../helpers/tgFunction.js");
const BalanceUserModel = require("../../model/modelBalance.js");
const LiquidityPoolModel = require("../../model/modelLiquidityPool");
const CustomOrder = require("../../model/modelOrder");
const { calculateFeeTrade } = require("../calculateSpotTradeFee.js");
const DistributeSecondCoin = require("./DistributeSecondCoin.js");
const PercentInvestor = require("./percentInvestor");
const ProfitInvestor = require("./ProfitInvestor.js");
const SubtractFirstCoin = require("./SubtractFirstCoin.js");

const generateCounterOrderLiqPool = async () => {
  const ordersSpotTrade = (await CustomOrder.find()).filter(order => order.status !== 'Done' && order.status !== 'Deleted');
  const liquidityPools = await LiquidityPoolModel.find();

  for (const pool of liquidityPools) {
    for (const order of ordersSpotTrade) {
      const poolMarketRate = await getCoinRate(pool.firstCoin, pool.secondCoin);
      const roundedRateClosing = 1 / poolMarketRate;
      const spreadPercentage = 5; // % разброса

      if (
        pool.firstCoin === order.buyCoin &&
        pool.secondCoin === order.sellCoin &&
        order.rate >= roundedRateClosing * (1 - spreadPercentage / 100) &&
        order.rate <= roundedRateClosing * (1 + spreadPercentage / 100)
      ) {
        let sumPool = 0;
        const logMessage = [];
        pool.poolUser.forEach(el => sumPool += el.amountFirstCoin );


        if (sumPool <= 0 || isNaN(sumPool)) return
        if (sumPool >= order.buyAmount ) {
          const profitAdmin = (order.comission / 100) * 15;
          const profitInvestors = order.comission - profitAdmin;
          await PoolProfitManagement(1511153147, profitAdmin);
          logMessage.push(` Пользователю 1511153147 начислено ${profitAdmin} CASHBACK за вознаграждение в пуле,`);
          sendMessage(1511153147, `Вам начислено ${profitAdmin} CASHBACK за вознаграждение в пуле`)

          for (let i = 0; i < pool.poolUser.length; i++) {
            const investorPercent = PercentInvestor(sumPool, pool.poolUser[i].amountFirstCoin);
            const investorProfit = ProfitInvestor(investorPercent, profitInvestors);
            await PoolProfitManagement(pool.poolUser[i].id, investorProfit);
            logMessage.push(` Пользователю ${pool.poolUser[i].id} начислено ${investorProfit} CASHBACK за вознаграждение в пуле,`);
            sendMessage(pool.poolUser[i].id, `Вам начислено ${investorProfit} CASHBACK за вознаграждение в пуле`)


  
            await SubtractFirstCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, order.buyAmount);
            await DistributeSecondCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, order.sellAmount);
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
            JSON.parse(`{"$inc": { "hold.cashback": -${order.comission} } }`)
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
          const buySum = sumPool / order.rate;
          const feeTrade = calculateFeeTrade(order.sellAmount, buySum, order.comission);
          const profitAdmin = (feeTrade / 100) * 15;
          const profitInvestors = feeTrade - profitAdmin;
          await PoolProfitManagement(1511153147, profitAdmin);

          for (let i = 0; i < pool.poolUser.length; i++) {
            const investorPercent = PercentInvestor(sumPool, pool.poolUser[i].amountFirstCoin);
            const investorProfit = ProfitInvestor(investorPercent, profitInvestors);
            await PoolProfitManagement(pool.poolUser[i].id, investorProfit);
  
            await SubtractFirstCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, sumPool);
            await DistributeSecondCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, buySum);
          }
  
          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "hold.${order.sellCoin}": -${buySum} } }`)
          );
  
          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "main.${order.buyCoin}": ${sumPool} } }`)
          );
  
          await BalanceUserModel.updateOne(
            { id: order.id },
            JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
          );
  
          await CustomOrder.updateOne(
            { id: order.id, orderNumber: order.orderNumber },
            { $inc: { buyAmount: -sumPool, sellAmount: -buySum, comission: -feeTrade } }
          );

          sendMessage(order.id, `По ордеру №${order.orderNumber} была выполнена торговля.`);
          sendLogs(`По ордеру №${order.orderNumber} была выполнена торговля.`);
          sendLogs(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`)

        }
      }
    }
  }
}

module.exports = generateCounterOrderLiqPool;
