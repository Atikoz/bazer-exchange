import { InlineButton } from "telebot";
import { bot } from "../../bot";

import getTranslation from "../../translations";

export const cabinetIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'deposit'), { callback: 'replenishment' }), bot.inlineButton(getTranslation(lang, 'withdraw'), { callback: 'withdrawal' })],
  [bot.inlineButton(getTranslation(lang, 'balance'), { callback: 'balance' })]
]);

export const acceptCancelWithdrawalIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'confirmText'), { callback: 'acceptWithdrawal' }), bot.inlineButton(getTranslation(lang, 'cancelText'), { callback: 'cancel' })]
]);

export const acceptCancelExchangeIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'confirmText'), { callback: 'accept_exchange' }), bot.inlineButton(getTranslation(lang, 'cancelText'), { callback: 'cancel' })]
]);

export const balanceIK = (page: number, totalPages: number) => {
  const keyboard: InlineButton[][] = [];

  if (page === 1) {
    keyboard.push([bot.inlineButton('Далее 🔜', { callback: `balance_Page_2` })]);
  } else if (page === totalPages) {
    keyboard.push([bot.inlineButton(`Назад 🔙`, { callback: `balance_Page_${page - 1}` })]);
  } else {
    keyboard.push([
      bot.inlineButton(`Назад 🔙`, { callback: `balance_Page_${page - 1}` }),
      bot.inlineButton(`Далее 🔜`, { callback: `balance_Page_${page + 1}` }),
    ]);
  }

  return bot.inlineKeyboard(keyboard);
}