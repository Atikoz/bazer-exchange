const TeleBot = require('telebot');
const config = require('../config.js');

const bot = new TeleBot(config.token);


async function sendLogs(text) {
  bot.sendMessage('@p2plogss', `${text}`, { parseMode: 'html' });
};

module.exports = sendLogs;