import backupDatabase from '../function/backupDataBase';
import { CronJob } from 'cron';

const backupDB = new CronJob('0 0 * * *', () => {
  try {
    console.log('Запуск ежедневного бэкапа');
    backupDatabase();
  } catch (error) {
    console.error((error as Error).message);
  }
});

export default backupDB;
