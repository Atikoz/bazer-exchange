const config = require('../config.js');
const TeleBot = require('telebot');

const bot = new TeleBot(config.token);

const sendMessage = (id, message) => {
  bot.sendMessage(id, message, { parseMode: 'html' });
};

const getChatMember = async (channel, userId) => {
  try {
    const a = await bot.getChatMember(channel, userId).catch((e) => { console.log('channel', channel, 'error', e) });
    console.log(channel, a);
    return a
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  sendMessage,
  getChatMember
};