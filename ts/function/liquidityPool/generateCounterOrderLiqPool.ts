import CustomOrder, { ICustomOrder } from '../../model/modelOrder'
import GetRate from '../rate/getRate'
import LiquidityPoolModel, { ILiquidityPool } from '../../model/liquidityPool/modelLiquidityPool'
import PoolProfitManagement from '../../helpers/poolProfitManagement';
import PercentInvestor from './percentInvestor';
import ProfitInvestor from './ProfitInvestor';
import SubtractFirstCoin from './SubtractFirstCoin';
import DistributeSecondCoin from './DistributeSecondCoin';
import BalanceUserModel from '../../model/modelBalance';
import sendMessage from '../../helpers/sendMessage';
import sendLogs from '../../helpers/sendLog';
import calculateFee from '../../function/commissionCalculations';


const generateCounterOrderLiqPool = async (): Promise<void> => {
  const ordersSpotTrade: ICustomOrder[] | null = (await CustomOrder.find()).filter(order => order.status !== 'Done' && order.status !== 'Deleted');
  const liquidityPools: ILiquidityPool[] | null = await LiquidityPoolModel.find();

  for (const pool of liquidityPools) {
    for (const order of ordersSpotTrade) {
      const poolMarketRate = await GetRate.getCoinRate(pool.firstCoin, pool.secondCoin);

      if (!poolMarketRate) return

      const roundedRateClosing = 1 / poolMarketRate;
      const spreadPercentage = 5; // % разброса

      if (
        pool.firstCoin === order.buyCoin &&
        pool.secondCoin === order.sellCoin &&
        +order.rate >= roundedRateClosing * (1 - spreadPercentage / 100) &&
        +order.rate <= roundedRateClosing * (1 + spreadPercentage / 100)
      ) {
        let sumPool: number = 0;
        pool.poolUser.forEach(el => sumPool += el.amountFirstCoin );

        if (sumPool <= 0 || isNaN(sumPool)) return

        if (sumPool >= +order.buyAmount ) {
          const profitAdmin = (+order.comission / 100) * 15;
          const profitInvestors = +order.comission - profitAdmin;
          await PoolProfitManagement(1511153147, profitAdmin);

          for (let i = 0; i < pool.poolUser.length; i++) {
            const investorPercent = PercentInvestor(sumPool, pool.poolUser[i].amountFirstCoin);

            if (!investorPercent) return

            const investorProfit = ProfitInvestor(investorPercent, profitInvestors);

            if (!investorProfit) return

            await PoolProfitManagement(pool.poolUser[i].id, investorProfit);
  
            await SubtractFirstCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, +order.buyAmount);
            await DistributeSecondCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, +order.sellAmount);
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

          sendMessage(+order.id, `Ордер №${order.orderNumber} был выполнен ✅.`);
          sendLogs(`Ордер №${order.orderNumber} был выполнен ✅.`);
          sendLogs(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`)

        } else {
          const buySum: number = sumPool / +order.rate;
          const feeTrade: number | void = calculateFee.calculateFeeTrade(+order.sellAmount, buySum, +order.comission);

          if (!feeTrade) return

          const profitAdmin: number = (feeTrade / 100) * 15;
          const profitInvestors: number = feeTrade - profitAdmin;
          await PoolProfitManagement(1511153147, profitAdmin);

          for (let i = 0; i < pool.poolUser.length; i++) {
            const investorPercent = PercentInvestor(sumPool, pool.poolUser[i].amountFirstCoin);

            if (!investorPercent) return

            const investorProfit = ProfitInvestor(investorPercent, profitInvestors);

            if (!investorProfit) return

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

          sendMessage(+order.id, `По ордеру №${order.orderNumber} была выполнена торговля.`);
          sendLogs(`По ордеру №${order.orderNumber} была выполнена торговля.`);
          sendLogs(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`)

        }
      }
    }
  }
}

export default generateCounterOrderLiqPool;