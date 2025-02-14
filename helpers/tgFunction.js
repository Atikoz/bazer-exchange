const config = require('../config.js');
const TeleBot = require('telebot');

const bot = new TeleBot(config.token);

const sendMessage = (id, message, options = { parseMode: 'html' }) => {
  bot.sendMessage(id, message, options).catch((e) => console.log(e));
};

const getChatMember = async (channel, userId) => {
  try {
    const chatMemberInfo = await bot.getChatMember(channel, userId).catch((e) => { console.log('channel', channel, 'error', e) });
    return chatMemberInfo
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  sendMessage,
  getChatMember
};