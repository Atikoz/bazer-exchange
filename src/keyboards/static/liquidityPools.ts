import { bot } from "../../bot";

import getTranslation from "../../translations";

export const poolMenuIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'singleLiquidityPoolsIK'), { callback: 'singleLiquidityPools' }), bot.inlineButton(getTranslation(lang, 'dualLiquidityPoolsIK'), { callback: 'dualLiquidityPool' })],
  [bot.inlineButton('Снять прибыль с пулов', { callback: 'profitLiquidityPools' })]
]);

export const singleLiquidityPoolsIK = bot.inlineKeyboard([
  [bot.inlineButton('Инвестировать в пул', { callback: 'investInSinglePool' }), bot.inlineButton('Мои инвестиции', { callback: 'mySingleLiquidityPools' })],
  [bot.inlineButton('Информация о пулах', { callback: 'infoSingleLiquidityPools' })]
]);

export const doubleLiquidityPoolsIK = bot.inlineKeyboard([
  [bot.inlineButton('Инвестировать в пул', { callback: 'investInDoublePool' }), bot.inlineButton('Мои инвестиции', { callback: 'myDoubleLiquidityPools' })],
  [bot.inlineButton('Информация о пулах', { callback: 'infoDoubleLiquidityPools' })]
]);

export const investInSinglePoolIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'createPool'), { callback: 'createSingleLiquidityPool' }), bot.inlineButton(getTranslation(lang, 'existingPools'), { callback: 'existingSinglePool' })]
]);

export const investInDoublePoolIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'createPool'), { callback: 'createDuobleLiquidityPool' }), bot.inlineButton(getTranslation(lang, 'existingPools'), { callback: 'existingDuoblePool' })]
]);

export const investInSinglePoolButtonIK = (firstCoin: string, secondCoin: string, lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'investInPoolButton'), { callback: `investInSelectSinglePool_${firstCoin}_${secondCoin}` })]
]);

export const investInDublePoolButtonIK = (firstCoin: string, secondCoin: string, lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'investInPoolButton'), { callback: `investInSelectDublePool_${firstCoin}_${secondCoin}` })]
]);
