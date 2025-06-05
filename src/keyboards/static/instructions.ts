import { bot } from "../../bot";

import getTranslation from "../../translations";

export const instructionsMenuIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'pools'), { callback: 'instructionsLiquidityPools' }), bot.inlineButton('P2P', { callback: 'instructionsP2P' })],
  [bot.inlineButton(getTranslation(lang, 'spotTrading'), { callback: 'instructionsSpotTrade' })]
]);

export const instructionsLiuidityPoolMenuIK = (lang: 'ru' | 'eng' = 'ru') => bot.inlineKeyboard([
  [bot.inlineButton(getTranslation(lang, 'instructionsInvestInLiqPool'), { callback: 'instructionsInvestInLiqPool' })]
]);