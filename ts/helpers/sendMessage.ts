import TeleBot from 'telebot';
import config from '../config';

const bot = new TeleBot(config.token);

function sendMessage(id: number | string, message: string): void {
  bot.sendMessage(id, message, { parseMode: 'html' })
};

export default sendMessage;
