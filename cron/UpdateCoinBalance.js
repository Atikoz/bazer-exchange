const BalanceUserModel = require('../model/modelBalance.js');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;

const updateCoinBalance = new CronJob('*/30 * * * * *', async () => {

  mongoose.connect('mongodb://127.0.0.1/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Функция для проверки и добавления полей
  async function checkAndAddFields() {
    try {
      // Поиск документа
      const document = await BalanceUserModel.findOne({});

      // Проверка наличия полей внутри main
      const requiredFields = [
        'del',
        'pro',
        'dar',
        'sbt',
        'reboot',
        'makarovsky',
        'btt',
        'dixwell',
        'avt',
        'kharat',
        'byacademy',
        'itcoin',
        'patrick',
        'messege',
        'rrunion',
        'vegvisir',
        'fbworld',
        'dcschool',
        'comcoin',
        'mintcandy',
        'sirius',
        'cgttoken',
        'genesis',
        'taxicoin',
        'prosmm',
        'sharafi',
        'safecoin',
        'dtradecoin',
        'izicoin',
        'gzacademy',
        'workout',
        'zaruba',
        'magnetar',
        'candypop',
        'randomx',
        'ekology',
        'emelyanov',
        'belymag',
        'doorhan',
        'lakshmi',
        'ryabinin',
        'related',
        'monopoly',
        'baroncoin',
        'nashidela',
        'irmacoin',
        'maritime',
        'business',
        'randice',
        'alleluia',
        'hosanna',
        'cbgrewards',
        'novoselka',
        'monkeyclub',
        'grandpay',
        'magnate',
        'crypton',
        'iloveyou',
        'bazercoin',
        'bazerusd',

      ];
      let fieldsAdded = false;

      for (const field of requiredFields) {
        if (!document || !document.main || document.main[field] === undefined) {
          // Если поле отсутствует, добавление с значением 0
          await BalanceUserModel.updateOne({}, { $set: { [`main.${field}`]: 0 } });
          fieldsAdded = true;
        }
      }

      if (fieldsAdded) {
        console.log('Поля добавлены');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  checkAndAddFields();
});

module.exports = updateCoinBalance;