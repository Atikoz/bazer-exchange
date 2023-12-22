const TeleBot = require('telebot');
const config = require('../config.js');

const bot = new TeleBot(config.token);


function generateButton(arrayElement, nameCallback) {
  const IK = [];
  arrayElement.map((e, i) => {
    if (i % 2 === 0) {
      IK.push([bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` })]);
    } else {
      IK[Math.floor(i / 2)].push(bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` }));
    }
  });
  return bot.inlineKeyboard(IK);
};

module.exports = generateButton;