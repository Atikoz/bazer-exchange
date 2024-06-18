import generateCounterOrderLiqPool from '../function/liquidityPool/generateCounterOrderLiqPool';
import CheckOrders from '../service/checkOrders.ts';

import { CronJob } from 'cron';

const checkOrders = new CronJob('0 */1 * * * *', async () => {
  try {
    await CheckOrders();
    await generateCounterOrderLiqPool();
  } catch (error) {
    console.error((error as Error).message);
  }
});

export default checkOrders;