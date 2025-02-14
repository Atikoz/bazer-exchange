const { getCoinRate } = require("../../helpers/getCoinRate.js");
const PoolProfitManagement = require("../../controlFunction/poolProfitManagement.js");
const sendLogs = require("../../helpers/sendLog.js");
const { sendMessage } = require("../../helpers/tgFunction.js");
const BalanceUserModel = require("../../model/user/modelBalance.js");
const CustomOrder = require("../../model/modelOrder.js");
const CalculateFee = require("../calculateSpotTradeFee.js");
const DistributeSecondCoin = require("./DistributeSecondCoin.js");
const PercentInvestor = require("./percentInvestor.js");
const ProfitInvestor = require("./ProfitInvestor.js");
const SubtractFirstCoin = require("./SubtractFirstCoin.js");
const DoubleLiquidityPool = require("../../model/liquidityPools/modelDoubleLiqPools.js");

const findLiquidityPool = async (sellCoin, buyCoin) => {
  let pool = await DoubleLiquidityPool.findOne({ firstCoin: sellCoin, secondCoin: buyCoin });

  if (!pool) {
    pool = await DoubleLiquidityPool.findOne({ firstCoin: buyCoin, secondCoin: sellCoin });
  }

  return pool;
};

const generateCounterOrderDoubleLiqPool = async () => {
  try {
    const allOrder = await CustomOrder.find();
    const filtredOrdersSpotTrade = allOrder.filter(order => order.status !== 'Done' && order.status !== 'Deleted');

    for (const order of filtredOrdersSpotTrade) {
      const pool = await findLiquidityPool(order.sellCoin, order.buyCoin);

      if (!pool) {
        return
      }

      const poolMarketRate = getCoinRate(pool.firstCoin, pool.secondCoin);
      const roundedRateClosing = 1 / poolMarketRate;
      const spreadPercentage = 5; // % разброса


    }
  } catch (error) {
    console.error(`error generate counter order double liq pool: ${error.message}`)
  }
}

module.exports = generateCounterOrderDoubleLiqPool;
