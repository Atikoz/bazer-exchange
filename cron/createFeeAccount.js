const { createNewAcc } = require('../service/register/createNewAccAndRegister');
const CronJob = require('cron').CronJob;

const createFreeAcc = new CronJob('* * * * *', () => {
  try {
    console.log('Запуск создания свободных аккаунтов');
    createNewAcc();
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = createFreeAcc;
