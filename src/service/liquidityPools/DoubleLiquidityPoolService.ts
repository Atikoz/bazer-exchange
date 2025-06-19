import DoubleLiquidityPool, { DoubleLiquidityPoolDocument } from "../../models/liquidityPools/modelDoubleLiqPools";
import CustomOrder, { CustomOrderDocument } from "../../models/spotTrade/modelOrder";
import BalanceUser from "../../models/user/BalanceModel";
import { poolProfitManagement } from "../balance/ProfitPoolService";
import RateAggregator from "../rate/RateAggregator";
import BotService from "../telegram/BotService";
import { SpotTradeFeeCalculator } from "../../utils/calculators/spotTradeFeeCalculator";
import { LiquidityCalculator } from "../../utils/calculators/LiquidityCalculator";
import BalanceService from "../balance/BalanceService";

const ADMIN_ID = process.env.ADMIN_ID;
const LIQUIDITY_LOG_CHANNEL_ID = process.env.LIQUIDITY_LOG_CHANNEL_ID;


export class DoubleLiquidityPoolService {
  static async subtractCoinDualPool(firstCoin: string, secondCoin: string, buyCoin: string, userId: number, percent: number, amount: number): Promise<void> {
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

      const coinSide = buyCoin === firstCoin ? 'amountFirstCoin' : 'amountSecondCoin';

      const poolSum = findPool.poolUser.reduce((acc, user) => {
        return acc + (coinSide === 'amountFirstCoin' ? user.amountFirstCoin : user.amountSecondCoin);
      }, 0);

      const sumInvestor = (percent / 100) * amount;

      if (poolSum < amount - 1e-8) {
        throw new Error(`Insufficient total liquidity in pool for ${buyCoin}`);
      }

      const userBalanceBefore = findUser[coinSide];

      if (userBalanceBefore < sumInvestor - 1e-8) {
        throw new Error(`User ${userId} has insufficient ${buyCoin} balance in pool (have: ${userBalanceBefore}, need: ${sumInvestor})`);
      }

      findUser[coinSide] -= sumInvestor;

      findPool.markModified('poolUser');
      await findPool.save();

      const userBalanceAfter = findUser[coinSide];
      console.log(`[Double POOL] Subtracted ${sumInvestor.toFixed(8)} ${buyCoin} from user ${userId}. Balance: ${userBalanceBefore.toFixed(8)} → ${userBalanceAfter.toFixed(8)}`);
    } catch (error) {
      console.error(`Error in subtracting first coin double liq pool: ${error.message}`);
      throw error
    }
  };

  static async distributeCoinDualPool(firstCoin: string, secondCoin: string, sellCoin: string, userId: number, percent: number, amount: number): Promise<void> {
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

      const coinSide = sellCoin === firstCoin ? 'amountFirstCoin' : 'amountSecondCoin';
      const sumInvestor = (percent / 100) * amount;

      if (!isFinite(sumInvestor) || sumInvestor <= 0) {
        throw new Error(`Invalid sum to distribute: ${sumInvestor}`);
      }

      const userBalanceBefore = findUser[coinSide];
      findUser[coinSide] += sumInvestor;

      findPool.markModified('poolUser');
      await findPool.save();

      const userBalanceAfter = findUser[coinSide];
      console.log(`[Double POOL] Distributed ${sumInvestor.toFixed(8)} ${sellCoin} to user ${userId}. Balance: ${userBalanceBefore.toFixed(8)} → ${userBalanceAfter.toFixed(8)}`);
    } catch (error) {
      console.error(`Error in distributing second coin double liq pool: ${error.message}`);
      throw error
    }
  };

  static async withdrawInvestments(firstCoin: string, secondCoin: string, withdrawCoin: string, userId: number, amount: number): Promise<void> {
    try {
      const findPool = await DoubleLiquidityPool.findOne({ firstCoin: firstCoin, secondCoin: secondCoin });

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
      console.error(`Error in withdrawing investments from double liq pool: ${error.message}`);
      throw error
    }
  };

  private static async rewardAdminAndInvestorsDouble(
    pool: DoubleLiquidityPoolDocument,
    order: CustomOrderDocument,
    sumPoolBuyCoin: number,
    buyAmount: number,
    sellAmount: number,
    profitAdmin: number,
    profitInvestors: number,
    logMessage: string[]
  ): Promise<void> {
    await poolProfitManagement(+ADMIN_ID, profitAdmin);
    logMessage.push(`Пользователю ${ADMIN_ID} начислено ${profitAdmin} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`);
    await BotService.sendMessage(ADMIN_ID, `Вам начислено ${profitAdmin} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}`);

    for (const user of pool.poolUser) {
      const investorPercent = order.buyCoin === pool.firstCoin
        ? LiquidityCalculator.percentInvestor(sumPoolBuyCoin, user.amountFirstCoin)
        : LiquidityCalculator.percentInvestor(sumPoolBuyCoin, user.amountSecondCoin);

      const investorProfit = LiquidityCalculator.profitInvestor(investorPercent, profitInvestors);

      console.log('investorPercent', investorPercent)
      console.log('investorProfit', investorProfit)

      await poolProfitManagement(user.id, investorProfit);
      logMessage.push(`Пользователю ${user.id} начислено ${investorProfit} ${SpotTradeFeeCalculator.commissionCoin}`);

      await BotService.sendMessage(user.id, `Вам начислено ${investorProfit} ${SpotTradeFeeCalculator.commissionCoin}`);

      await this.subtractCoinDualPool(pool.firstCoin, pool.secondCoin, order.buyCoin, user.id, investorPercent, buyAmount);
      await this.distributeCoinDualPool(pool.firstCoin, pool.secondCoin, order.sellCoin, user.id, investorPercent, sellAmount);
    }
  };

  private static async updateUserBalancesDouble(
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

  static async generateCounterOrderDoubleLiqPool(): Promise<void> {
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

        const poolMarketRate = await RateAggregator.getCoinRate(order.sellCoin, order.buyCoin);

        console.log('poolMarketRate', poolMarketRate)

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

          console.log(sumPool)

          if (sumPool[order.buyCoin] <= 0) {
            continue
          }

          if (sumPool[order.buyCoin] >= order.buyAmount) {
            const profitAdmin = (order.comission / 100) * 15;
            const profitInvestors = order.comission - profitAdmin;

            await this.rewardAdminAndInvestorsDouble(pool, order as CustomOrderDocument, sumPool[order.buyCoin], order.buyAmount, order.sellAmount, profitAdmin, profitInvestors, logMessage);
            await this.updateUserBalancesDouble(order as CustomOrderDocument, order.sellAmount, order.buyAmount, order.comission);

            await CustomOrder.updateOne(
              { id: order.id, orderNumber: order.orderNumber },
              { $set: { status: 'Done' } }
            )

            BotService.sendMessage(order.id, `Ордер №${order.orderNumber} был выполнен ✅.`);
            BotService.sendLog(`Ордер №${order.orderNumber} был выполнен ✅.`);
            BotService.sendLog(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`);
            BotService.sendLog(logMessage.join('\n'));
          } else {
            const buySum = sumPool[order.buyCoin];
            const sellSum = buySum / order.rate;
            const feeTrade = SpotTradeFeeCalculator.calculatePartial(sellSum, buySum, order.comission, order.sellAmount, order.buyAmount);

            const profitAdmin = (feeTrade / 100) * 15;
            const profitInvestors = feeTrade - profitAdmin;

            await this.rewardAdminAndInvestorsDouble(pool, order as CustomOrderDocument, sumPool[order.buyCoin], buySum, sellSum, profitAdmin, profitInvestors, logMessage);
            await this.updateUserBalancesDouble(order as CustomOrderDocument, sellSum, buySum, feeTrade);

            await CustomOrder.updateOne(
              { id: order.id, orderNumber: order.orderNumber },
              { $inc: { buyAmount: -buySum, sellAmount: -sellSum, comission: -feeTrade } }
            );

            BotService.sendMessage(order.id, `По ордеру №${order.orderNumber} была выполнена торговля.`);
            BotService.sendLog(`По ордеру №${order.orderNumber} была выполнена торговля.`);
            BotService.sendLog(`Была выполнена торговля через пул ликвидности ${pool.firstCoin.toUpperCase()}/${pool.secondCoin.toUpperCase()}.`);
            BotService.sendLog(logMessage.join('\n'));
          }
        }
      }
    } catch (error) {
      console.error(`error generate counter order double liq pool: ${error.message}`);
      throw error
    }
  };

  static async depositToPool(firstCoin: string, secondCoin: string, investCoin: string, userId: number, amount: number): Promise<void> {
    const pool = await DoubleLiquidityPool.findOne({
      $or: [
        { firstCoin, secondCoin },
        { firstCoin: secondCoin, secondCoin: firstCoin }
      ]
    });

    if (!pool) {
      await DoubleLiquidityPool.create({
        firstCoin,
        secondCoin,
        poolUser: [{
          id: userId,
          amountFirstCoin: investCoin === firstCoin ? amount : 0,
          amountSecondCoin: investCoin === secondCoin ? amount : 0
        }]
      });
    } else {
      const existingUser = pool.poolUser.find(user => user.id === userId);

      if (existingUser) {
        if (investCoin === pool.firstCoin) {
          existingUser.amountFirstCoin += +amount;
        } else if (investCoin === pool.secondCoin) {
          existingUser.amountSecondCoin += +amount;
        }
      } else {
        pool.poolUser.push({
          id: userId,
          amountFirstCoin: investCoin === firstCoin ? +amount : 0,
          amountSecondCoin: investCoin === secondCoin ? +amount : 0
        });
      }

      pool.markModified('poolUser');
      await pool.save();
    }
  };

  static async adminProvideLiquidityIfNeeded(): Promise<void> {
    try {
      const bufferPercent = 0.05; // +5% як страховка
      const orders = await CustomOrder.find({ status: { $nin: ['Done', 'Deleted'] } });

      for (const order of orders) {
        const firstCoin = order.sellCoin;
        const secondCoin = order.buyCoin;

        const pool = await DoubleLiquidityPool.findOne({
          $or: [
            { firstCoin, secondCoin },
            { firstCoin: secondCoin, secondCoin: firstCoin }
          ]
        });

        // Якщо пулу ще немає — створимо з 0 ліквідністю
        const poolData = pool || await DoubleLiquidityPool.create({
          firstCoin,
          secondCoin,
          poolUser: []
        });

        // Підрахунок існуючої ліквідності
        const sumPool = poolData.poolUser.reduce((acc, user) => {
          acc[firstCoin] += user.amountFirstCoin;
          acc[secondCoin] += user.amountSecondCoin;
          return acc;
        }, { [firstCoin]: 0, [secondCoin]: 0 });

        const coinNeeded = order.buyCoin.toLowerCase();
        const deficit = order.buyAmount - sumPool[coinNeeded];

        if (deficit <= 0) {
          continue; // ліквідність достатня
        }

        const bufferAmount = deficit * (1 + bufferPercent); // з надбавкою

        // Читаємо баланс адміна
        const adminBalance = await BalanceService.getBalance(+ADMIN_ID, coinNeeded);

        if (adminBalance < bufferAmount) {
          await BotService.sendLog(
            `❌ Недостаточно резервов у админа для ${coinNeeded.toUpperCase()} — необходимо ${bufferAmount.toFixed(8)}, в наличии ${adminBalance.toFixed(8)}`,
            LIQUIDITY_LOG_CHANNEL_ID
          );
          continue;
        }

        // Списання з балансу
        await BalanceService.updateBalance(+ADMIN_ID, coinNeeded, -bufferAmount);

        // Додавання до пулу
        await this.depositToPool(firstCoin, secondCoin, coinNeeded, +ADMIN_ID, bufferAmount);

        await BotService.sendLog(
          `✅ Админ ${ADMIN_ID} добавил ${bufferAmount.toFixed(8)} ${coinNeeded.toUpperCase()} в пул ликвидности ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()} для ордера №${order.orderNumber}`
        );
      }
    } catch (error) {
      console.error('error provide liquidity');
      BotService.sendLog(`Ошибка пополнения ликвидности: ${error.message}`)
    }
  }
}