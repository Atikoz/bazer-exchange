import TeleBot from 'telebot';
import config from '../config';

const bot = new TeleBot(config.token);

function generateButton(arrayElement: string[], nameCallback: string) {
  const IK: any[] = [];
  arrayElement.forEach((e, i) => {
    if (i % 2 === 0) {
      IK.push([bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` })]);
    } else {
      IK[Math.floor(i / 2)].push(bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` }));
    }
  });
  return bot.inlineKeyboard(IK);
}

export default generateButton;

