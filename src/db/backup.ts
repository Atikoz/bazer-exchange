import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const MONGO_URI = process.env.MONGO_URI as string;


export function backupDatabase(): void {
  const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
  const backupFileName = `backup_${timestamp}.gz`;

  const backupDir = path.join(__dirname, '..', '..', 'backup_db');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const backupFilePath = path.join(backupDir, backupFileName);
  const command = `mongodump --uri="${MONGO_URI}" --archive=${backupFilePath} --gzip`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка выполнения команды: `, error);
      return;
    }

    if (stderr) {
      console.error(`Ошибка: ${stderr}`);
      return;
    }

    console.log(`Результат: ${stdout}`);
    console.log(`Бэкап успешно создан: ${backupFilePath}`);
  });
}
