import { bot } from "../../bot";

import getTranslation from "../../translations";


export const startKeyboard = (lang: 'ru' | 'eng' = 'ru') => bot.keyboard([
  [getTranslation(lang, 'register')],
  [getTranslation(lang, 'login')]
], { resize: true });

