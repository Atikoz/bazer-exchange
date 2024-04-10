const ExchangeCheckStatus = require('../../exchanger/exchangerCheckStatus.js');
const ExchangerStatus = require('../../model/modelExchangeStatus.js');

const CronJob = require('cron').CronJob;

const checkUserExchangeTransaction = new CronJob('0 */1 * * * *', async () => {
  try {
    const status = await ExchangerStatus.find({});
    status.map(async (w) => {
      if (w.status === 'Done' && w.processed || w.status === 'Fail' && w.processed) return;
      await ExchangeCheckStatus.ExchangeCheckHash(w.id, w.hash, w.coinSell, w.coinBuy)
    });
  } catch (error) {
    console.error(error)
  }
});

module.exports = checkUserExchangeTransaction;