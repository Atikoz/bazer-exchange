import { bot } from "../../bot";

import getTranslation from "../../translations";


export const buyDelForRubIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'buyDelForRubButton'), { url: 'https://t.me/+RseklArJALAwMDQy' })],
  [bot.inlineButton(getTranslation(lang, 'buyDelForRubInstrtuctionButton'), { url: 'https://decimalchain.com/blog/ru/kak-kupit-del-za-rubli/' })]
]);

export const buyCashbscIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'buyCashbsc'), { url: 'https://t.me/+RseklArJALAwMDQy' })],
  [bot.inlineButton(getTranslation(lang, 'instructions'), { url: 'https://google.com' })]
]);

export const bazerStackingIK = bot.inlineKeyboard([
  [bot.inlineButton('BAZER STAKING WALLET', { url: 'https://t.me/Bazer_stake_bot?start=d01pp9jcn0vphnq985fp0a7wf3zgvznshn938s868' })]
]);
