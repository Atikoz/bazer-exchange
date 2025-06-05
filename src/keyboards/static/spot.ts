import { bot } from "../../bot";

import getTranslation from "../../translations";

export const spotOrderMenu = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'currentOrders'), { callback: 'createdSpotOrders' }), bot.inlineButton(getTranslation(lang, 'createOrder'), { callback: 'createNewSpotOrders' })],
  [bot.inlineButton(getTranslation(lang, 'listOrders'), { callback: 'listSpotOrders' }), bot.inlineButton(getTranslation(lang, 'completeOrders'), { callback: 'completedSpotOrders' })],
]);

export const filterSpotOrdersIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'allSpotOrders' }), bot.inlineButton('Фильтр', { callback: 'filtredSpotOrders' })]
]);

export const filterCompleteSpotOrdersIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'allCompletedSpotOrders' }), bot.inlineButton('Фильтр', { callback: 'filtredCompletedSpotOrders' })]
]);