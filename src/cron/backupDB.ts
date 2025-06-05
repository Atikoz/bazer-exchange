import { CronJob } from 'cron';
import { backupDatabase } from '../db/backup';

const backupDB = new CronJob('0 0 * * *', () => {
  try {
    console.log('Запуск ежедневного бэкапа');
    backupDatabase();
  } catch (error) {
    console.error(error.message)
  }
})

export default backupDB;