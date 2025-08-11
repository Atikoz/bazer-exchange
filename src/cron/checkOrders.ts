

import { CronJob } from 'cron';
import SpotOrderMatcher from '../service/trade/SpotOrderMatcher'
import { DoubleLiquidityPoolService } from '../service/liquidityPools/DoubleLiquidityPoolService';

const checkMatchingOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    // 1. Спроба автоматичної торгівлі
    await SpotOrderMatcher.processOrders();
    // await DoubleLiquidityPoolService.generateCounterOrderDoubleLiqPool();

    // // 2. Долив ліквідності адміном
    // console.log('add liq')
    // await DoubleLiquidityPoolService.adminProvideLiquidityIfNeeded();

    // // 3. Повторна спроба автоматичної торгівлі
    // await DoubleLiquidityPoolService.generateCounterOrderDoubleLiqPool();

  } catch (error) {
    console.error(error)
  }
});

export default checkMatchingOrders;