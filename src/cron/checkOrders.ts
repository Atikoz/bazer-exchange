

import { CronJob } from 'cron';
import SpotOrderMatcher from '../service/trade/SpotOrderMatcher'
import { DoubleLiquidityPoolService } from '../service/liquidityPools/DoubleLiquidityPoolService';
import { SingleLiquidityPoolService } from '../service/liquidityPools/SingleLiquidityPoolService';

const checkMatchingOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    await SpotOrderMatcher.processOrders();
    await SingleLiquidityPoolService.generateCounterOrderLiqPool();
    await DoubleLiquidityPoolService.generateCounterOrderDoubleLiqPool();
  } catch (error) {
    console.error(error)
  }
});

export default checkMatchingOrders;