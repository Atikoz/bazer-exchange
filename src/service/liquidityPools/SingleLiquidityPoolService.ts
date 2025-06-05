import SingleLiquidityPool, { SingleLiquidityPoolDocument } from "../../models/liquidityPools/modelSingleLiquidityPool";
import CustomOrder, { CustomOrderDocument } from "../../models/spotTrade/modelOrder";
import BalanceUser from "../../models/user/BalanceModel";
import { poolProfitManagement } from "../balance/ProfitPoolService";
import RateAggregator from "../rate/RateAggregator";
import BotService from "../telegram/BotService";
import { SpotTradeFeeCalculator } from "../../utils/calculators/spotTradeFeeCalculator";
import { LiquidityCalculator } from "../../utils/calculators/LiquidityCalculator";


export class SingleLiquidityPoolService {
  static async subtractFirstCoin(firstCoin: string, secondCoin: string, userId: number, percent: number, amount: number): Promise<void> {
    try {
      const findPool = await SingleLiquidityPool.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
      if (!findPool) {
        throw new Error('Profit pool not found');
      }

      const findUser = findPool.poolUser.find(user => user.id === userId);
      if (!findUser) {
        throw new Error('User not found in the profit pool');
      }

      const sumPool = findPool.poolUser.reduce((acc, user) => {
        return acc + user.amountFirstCoin;
      }, 0);


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
    } catch (error) {
      console.error(`Error in subtracting first coin single liq pool: ${error.message}`);
      throw error
    }
  };

  static async distributeSecondCoin(firstCoin: string, secondCoin: string, userId: number, percent: number, amount: number): Promise<void> {
    try {
      const findPool = await SingleLiquidityPool.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
      if (!findPool) {
        throw new Error('Profit pool not found');
      }

      const findUser = findPool.poolUser.find(user => user.id === userId);
      if (!findUser) {
        throw new Error('User not found in the profit pool');
      }
      const onePercent = amount / 100;
      const sumInvestor = percent * onePercent;

      findUser.amountSecondCoin += sumInvestor;
      findPool.markModified('poolUser');

      await findPool.save();
    } catch (error) {
      console.error(`Error in distributing second coin single liq pool: ${error.message}`);
      throw error
    }
  };

  static async withdrawInvestments(firstCoin: string, secondCoin: string, withdrawCoin: string, userId: number, amount: number): Promise<void> {
    try {
      const findPool = await SingleLiquidityPool.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });
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
    } catch (error) {
      console.error(`Error in withdrawing investments from single liq pool: ${error.message}`);
      throw error
    }
  };

  private static async rewardAdminAndInvestorsSingle(
    pool: SingleLiquidityPoolDocument,
    sumPool: number,
    profitAdmin: number,
    profitInvestors: number,
    logMessage: string[]
  ): Promise<void> {
    await poolProfitManagement(1511153147, profitAdmin);
    logMessage.push(`Пользователю 1511153147 начислено ${profitAdmin} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`);
    await BotService.sendMessage(1511153147, `Вам начислено ${profitAdmin} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`);

    for (const user of pool.poolUser) {
      const investorPercent = LiquidityCalculator.percentInvestor(sumPool, user.amountFirstCoin);
      const investorProfit = LiquidityCalculator.profitInvestor(investorPercent, profitInvestors);

      await poolProfitManagement(user.id, investorProfit);
      logMessage.push(`Пользователю ${user.id} начислено ${investorProfit} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`);
      await BotService.sendMessage(user.id, `Вам начислено ${investorProfit} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`);
    }
  };

  private static async updateUserBalancesSingle(
    order: CustomOrderDocument,
    sellAmount: number,
    buyAmount: number,
    commission: number
  ): Promise<void> {
    await Promise.all([
      BalanceUser.updateOne(
        { id: order.id },
        { $inc: { [`hold.${order.sellCoin}`]: -sellAmount } }
      ),
      BalanceUser.updateOne(
        { id: order.id },
        { $inc: { [`main.${order.buyCoin}`]: buyAmount } }
      ),
      BalanceUser.updateOne(
        { id: order.id },
        { $inc: { [`hold.${SpotTradeFeeCalculator.commissionCoin}`]: -commission } }
      ),
    ]);
  };

  static async generateCounterOrderLiqPool(): Promise<void> {
    const ordersSpotTrade = (await CustomOrder.find()).filter(order => order.status !== 'Done' && order.status !== 'Deleted');
    const liquidityPools = await SingleLiquidityPool.find();

    for (const pool of liquidityPools) {
      for (const order of ordersSpotTrade) {
        const poolMarketRate = await RateAggregator.getCoinRate(pool.firstCoin, pool.secondCoin);
        const roundedRateClosing = 1 / poolMarketRate;
        const spreadPercentage = 5; // % разброса

        if (
          pool.firstCoin === order.buyCoin &&
          pool.secondCoin === order.sellCoin &&
          order.rate >= roundedRateClosing * (1 - spreadPercentage / 100) &&
          order.rate <= roundedRateClosing * (1 + spreadPercentage / 100)
        ) {

          const logMessage = [];
          const sumPool = pool.poolUser.reduce((acc, user) => acc + user.amountFirstCoin, 0);

          if (!sumPool) {
            continue
          }

          if (sumPool >= order.buyAmount) {
            const profitAdmin = (order.comission / 100) * 15;
            const profitInvestors = order.comission - profitAdmin;

            await this.rewardAdminAndInvestorsSingle(
              pool,
              sumPool,
              profitAdmin,
              profitInvestors,
              logMessage
            )

            for (const user of pool.poolUser) {
              const investorPercent = LiquidityCalculator.percentInvestor(sumPool, user.amountFirstCoin);
              await this.subtractFirstCoin(pool.firstCoin, pool.secondCoin, user.id, investorPercent, order.buyAmount);
              await this.distributeSecondCoin(pool.firstCoin, pool.secondCoin, user.id, investorPercent, order.sellAmount);
            }

            await this.updateUserBalancesSingle(order as CustomOrderDocument, order.sellAmount, order.buyAmount, order.comission);

            await CustomOrder.updateOne(
              { id: order.id, orderNumber: order.orderNumber },
              { $set: { status: 'Done' } }
            )

            BotService.sendMessage(order.id, `Ордер №${order.orderNumber} был выполнен ✅.`);
            BotService.sendLog(`Ордер №${order.orderNumber} был выполнен ✅.`);
            BotService.sendLog(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`);
            BotService.sendLog(logMessage.join('\n'));
          } else {
            const buySum = sumPool / order.rate;
            const feeTrade = SpotTradeFeeCalculator.calculatePartial(order.sellAmount, buySum, order.comission, order.sellAmount, order.buyAmount);
            const profitAdmin = (feeTrade / 100) * 15;
            const profitInvestors = feeTrade - profitAdmin;

            await this.rewardAdminAndInvestorsSingle(
              pool,
              sumPool,
              profitAdmin,
              profitInvestors,
              logMessage
            )

            for (let i = 0; i < pool.poolUser.length; i++) {
              const investorPercent = LiquidityCalculator.percentInvestor(sumPool, pool.poolUser[i].amountFirstCoin);
              await this.subtractFirstCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, sumPool);
              await this.distributeSecondCoin(pool.firstCoin, pool.secondCoin, pool.poolUser[i].id, investorPercent, buySum);
            }

            await this.updateUserBalancesSingle(order as CustomOrderDocument, buySum, sumPool, feeTrade);

            await CustomOrder.updateOne(
              { id: order.id, orderNumber: order.orderNumber },
              { $inc: { buyAmount: -sumPool, sellAmount: -buySum, comission: -feeTrade } }
            );

            BotService.sendMessage(order.id, `По ордеру №${order.orderNumber} была выполнена торговля.`);
            BotService.sendLog(`По ордеру №${order.orderNumber} была выполнена торговля.`);
            BotService.sendLog(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`);
            BotService.sendLog(logMessage.join('\n'));

          }
        }
      }
    }
  };

  static async depositToPool(firstCoin: string, secondCoin: string, userId: number, amount: number): Promise<void> {
    let pool = await SingleLiquidityPool.findOne({ firstCoin, secondCoin });

    if (!pool) {
      // Если пул не существует — создаем
      await SingleLiquidityPool.create({
        firstCoin,
        secondCoin,
        poolUser: [{
          id: userId,
          amountFirstCoin: amount,
          amountSecondCoin: 0,
        }]
      });
      return;
    }

    const user = pool.poolUser.find(u => u.id === userId);

    if (user) {
      user.amountFirstCoin += amount;
    } else {
      pool.poolUser.push({
        id: userId,
        amountFirstCoin: amount,
        amountSecondCoin: 0,
      });
    }

    pool.markModified('poolUser');
    await pool.save();
  }
}