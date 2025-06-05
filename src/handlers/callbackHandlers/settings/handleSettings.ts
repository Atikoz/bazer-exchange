import { Message } from "telebot";
import { parseAction } from "../../../utils/parseAction";
import UserManagement from "../../../service/user/UserManagement";
import getTranslation, { Language } from "../../../translations";
import BotService from "../../../service/telegram/BotService";
import { languageIK, RM_Home } from "../../../keyboards";
import AuthCodeService from "../../../service/mail/AuthCodeService";

async function handleSettings(msg: Message) {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'changeLang':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Выберите язык:', { replyMarkup: languageIK });
        break;

      case 'selectLang':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const selectedLang = params[0] as Language;
        await UserManagement.setLanguage(userId, selectedLang);

        BotService.sendMessage(userId, getTranslation(selectedLang, 'doneChange'), { replyMarkup: RM_Home(selectedLang) });
        break;

      case 'support':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, getTranslation(lang, 'supportText'));
        break;

      case 'changeEmail':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (!user.mail) {
          UserManagement.setState(userId, 23);
          BotService.sendMessage(userId, getTranslation(lang, 'updateMailPrompt'));
          return
        }
        const { status } = await AuthCodeService.sendEmailVerifyCode(user.mail);

        UserManagement.setState(userId, status ? 25 : 0);

        const message = status
          ? getTranslation(lang, 'confirmationPromptText')
          : getTranslation(lang, 'unexpectedError');

        BotService.sendMessage(userId, message);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler settings`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handleSettings