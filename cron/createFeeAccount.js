const { createNewAcc } = require('../service/register/createNewAccAndRegister');
const CronJob = require('cron').CronJob;

const createFreeAcc = new CronJob('* * * * *', () => {
  try {
    console.log('Запуск создание свободных аккаунтов');
    createNewAcc();
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = createFreeAcc;
