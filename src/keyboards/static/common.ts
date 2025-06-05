import { bot } from "../../bot";

import getTranslation from "../../translations";


export const cancelButton = bot.inlineKeyboard([
  [bot.inlineButton('Отмена', { callback: 'cancel' })],
]);

export const settingsIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'changeLang'), { callback: 'changeLang' }), bot.inlineButton(getTranslation(lang, 'support'), { callback: 'support' })],
  [bot.inlineButton(getTranslation(lang, 'changeEmail'), { callback: 'changeEmail' })],
]);

export const languageIK = bot.inlineKeyboard([
  [bot.inlineButton('English 🇬🇧', { callback: 'selectLang_eng' })],
  [bot.inlineButton('Русский 🇷🇺', { callback: 'selectLang_ru' })]
]);

export const exchangeIK = bot.inlineKeyboard([
  [bot.inlineButton('Decimal', { callback: 'decimalExchange' }), bot.inlineButton('Minter', { callback: 'minterExchange' })],
  [bot.inlineButton('Bazer', { callback: 'bazerExchange' })]
]);

export const adminPanelIK = bot.inlineKeyboard([
  [bot.inlineButton('Удалить найденую транзакцию', { callback: 'deleteUserHash' })]
]);
