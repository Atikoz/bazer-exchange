const backupDatabase = require('../function/backupDataBase');
const CronJob = require('cron').CronJob;

const backupDB = new CronJob('0 0 * * 0', () => {
  try {
    console.log('Запуск еженедельного бэкапа');
    backupDatabase();
  } catch (error) {
    console.error(error.message)
  }
})

module.exports = backupDB;