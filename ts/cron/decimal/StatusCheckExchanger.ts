import { CronJob } from 'cron';
import ExchangeStatus from '../../model/decimal/modelExchangeStatus';
import DecimalExchangeCheckHash from '../../exchanger/exchangerCheckStatus';

interface IExchangeStatusTransaction {
  id: string,
  hash: string,
  status: string,
  processed: boolean,
  coinSell: string,
  coinBuy: string
}

const checkUserExchangeTransaction = new CronJob('0 */1 * * * *', async (): Promise<void> => {
  try {
    const status: IExchangeStatusTransaction[] = await ExchangeStatus.find({});
    status.map(async (w) => {
      if (w.status === 'Done' && w.processed || w.status === 'Fail' && w.processed) return;
      await DecimalExchangeCheckHash(+w.id, w.hash, w.coinSell, w.coinBuy)
    });
  } catch (error) {
    console.error(error)
  }
});

export default checkUserExchangeTransaction;