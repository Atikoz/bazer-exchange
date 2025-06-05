import { bot } from '../../bot';
import { InlineButton, InlineKeyboard } from 'telebot';

export function generatePaginatedKeyboard(
  items: string[],
  nameCallback: string,
  page: number,
  maxPage = 4
): InlineKeyboard {
  const keyboard: InlineButton[][] = [];

  items.forEach((item, index) => {
    const button = bot.inlineButton(item, { callback: `${nameCallback}_${item}` });
    if (index % 2 === 0) {
      keyboard.push([button]);
    } else {
      keyboard[Math.floor(index / 2)].push(button);
    }
  });

  // pagination
  if (page === 1) {
    keyboard.push([bot.inlineButton(`Далее 🔜`, { callback: `${nameCallback}_Page_2` })]);
  } else if (page === maxPage) {
    keyboard.push([bot.inlineButton(`Назад 🔙`, { callback: `${nameCallback}_Page_3` })]);
  } else {
    keyboard.push([
      bot.inlineButton(`Назад 🔙`, { callback: `${nameCallback}_Page_${page - 1}` }),
      bot.inlineButton(`Далее 🔜`, { callback: `${nameCallback}_Page_${page + 1}` }),
    ]);
  }

  return bot.inlineKeyboard(keyboard);
}
