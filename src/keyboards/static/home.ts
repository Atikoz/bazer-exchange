import { bot } from "../../bot";

import getTranslation from "../../translations";


export const RM_Home = (lang: 'eng' | 'ru' = "eng") => bot.keyboard([
  [getTranslation(lang, "myAccount"), getTranslation(lang, "tradeButton")],
  [getTranslation(lang, "converting"), getTranslation(lang, "staking")],
  [getTranslation(lang, 'purchasingBazerHub'), getTranslation(lang, "referrals")],
  [getTranslation(lang, "settings"), getTranslation(lang, "instructions")],
  [getTranslation(lang, "buyDelForRub"), getTranslation(lang, "buyCashbsc")]
], { resize: true });

export const RM_Trade = (lang: 'ru' | 'eng' = 'ru') => bot.keyboard([
  [getTranslation(lang, 'spotTrading'), 'P2P'],
  [getTranslation(lang, 'pools')],
  [getTranslation(lang, 'mainMenuButton')]
], { resize: true });

export const RM_Settings = (lang: 'ru' | 'eng' = 'ru') => bot.keyboard([
  [getTranslation(lang, 'changeLang'), getTranslation(lang, 'changeEmail')],
  [getTranslation(lang, 'mainMenuButton')]
], { resize: true });