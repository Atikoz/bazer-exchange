import { InlineButton, InlineKeyboard } from "telebot";
import { bot } from "../../bot";

export function generateButton(items: string[], nameCallback: string): InlineKeyboard {
  const IK: InlineButton [][] = [];

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      IK.push([bot.inlineButton(`${item}`, { callback: `${nameCallback}_${item}` })]);
    } else {
      IK[Math.floor(index / 2)].push(bot.inlineButton(`${item}`, { callback: `${nameCallback}_${item}` }));
    }
  });

  return bot.inlineKeyboard(IK);
};