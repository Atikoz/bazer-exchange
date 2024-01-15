const TeleBot = require('telebot');
const config = require('../config.js');

const bot = new TeleBot(config.token);


async function sendLogs(text) {
  try {
    // console.log(text);
    bot.sendMessage('@p2plogss', `${text}`, { parseMode: 'html' });
  } catch (error) {
    console.error(error)
  }
};

module.exports = sendLogs;