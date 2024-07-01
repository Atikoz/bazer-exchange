const backupDatabase = require('../function/backupDatabase');
const CronJob = require('cron').CronJob;

const backupDB = new CronJob('0 0 * * *', () => {
  try {
    console.log('Запуск ежедневного бэкапа');
    backupDatabase();
  } catch (error) {
    console.error(error.message)
  }
})

module.exports = backupDB;