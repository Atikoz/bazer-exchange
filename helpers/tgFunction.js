const config = require('../config.js');
const TeleBot = require('telebot');

const bot = new TeleBot(config.token);

const sendMessage = (id, message) => {
  bot.sendMessage(id, message, { parseMode: 'html' });
};

module.exports = sendMessage;