const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');

function backupDatabase() {
    // 1. Генерация метки времени
    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
    
    // 2. Формирование имени файла для бэкапа
    const backupFileName = `backup_${timestamp}.gz`;

    // Путь к папке для бэкапов
    const backupDir = path.join(__dirname, '..', 'backup_db');

    // Создаем папку, если ее не существует
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir);
    }

    // 3. Определение полного пути к файлу бэкапа
    const backupFilePath = path.join(backupDir, backupFileName);
    
    // 4. Формирование команды для создания бэкапа
    const command = `mongodump --uri="${config.dataBaseUrl}" --archive=${backupFilePath} --gzip`;

    // 5. Выполнение команды для создания бэкапа
    exec(command, (error, stdout, stderr) => {
        // 6. Обработка ошибок
        if (error) {
            console.error(`Ошибка выполнения команды: ${error.message}`);
            return;
        }
        
        // 7. Обработка сообщений об ошибках
        if (stderr) {
            console.error(`Ошибка: ${stderr}`);
            return;
        }
        
        // 8. Вывод сообщения об успешном выполнении
        console.log(`Результат: ${stdout}`);
        console.log(`Бэкап успешно создан: ${backupFilePath}`);
    });
}

module.exports = backupDatabase;
