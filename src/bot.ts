import TeleBot from 'telebot';

const botToken = process.env.BOT_TOKEN;

if (!botToken) throw new Error('BOT_TOKEN is not defined');

export const bot = new TeleBot(botToken);
