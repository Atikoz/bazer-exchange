import { bot } from "../../bot";
import getTranslation from "../../translations";


export const typeP2P = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'p2pTradeButton'), { callback: 'tradeP2P' }), bot.inlineButton(getTranslation(lang, 'p2pDealButton'), { callback: 'dealP2P' })]
]);

export const tradeP2PMenuIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'myOrders'), { callback: 'createdP2POrders' }), bot.inlineButton(getTranslation(lang, 'createOrder'), { callback: 'newP2POrder' })],
  [bot.inlineButton(getTranslation(lang, 'buy'), { callback: 'showBuyP2POrders' }), bot.inlineButton(getTranslation(lang, 'sell'), { callback: 'showSellP2POrders' })]
]);

export const typeP2POrder = bot.inlineKeyboard([
  [bot.inlineButton('Купить', { callback: 'p2pBuy' }), bot.inlineButton('Продать', { callback: 'p2pSell' })],
  [bot.inlineButton('Назад 🔙', { callback: 'p2pBack' })]
]);

export const payOrder = bot.inlineKeyboard([
  [bot.inlineButton('Готово ✅', { callback: 'payOrder_accept' }), bot.inlineButton('Отменить ❌', { callback: 'payOrder_cancel' })]
]);

export const filterSellP2PIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'showAllOrdersP2P_sell' }), bot.inlineButton('Фильтр', { callback: 'filterOrdersP2P_sell' })]
]);

export const filterBuyP2PIK = bot.inlineKeyboard([
  [bot.inlineButton('Все ордера', { callback: 'showAllOrdersP2P_buy' }), bot.inlineButton('Фильтр', { callback: 'filterOrdersP2P_buy' })]
]);