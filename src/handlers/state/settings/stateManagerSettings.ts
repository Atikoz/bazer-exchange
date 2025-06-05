import { Message } from "telebot";
import BotService from "../../../service/telegram/BotService";
import getTranslation, { Language } from "../../../translations";
import UserManagement from "../../../service/user/UserManagement";
import { ValidatorService } from "../../../validator";
import AuthCodeService from "../../../service/mail/AuthCodeService";
import { UserContext } from "../../../context/userContext";
import User from "../../../models/user/UserModel";

async function stateManagerSettings(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language

    switch (state) {
      case 23:
        const enteredEmail = text.trim();

        const isValid = ValidatorService.User.isValidEmail(enteredEmail);
        if (!isValid) {
          await BotService.sendMessage(userId, getTranslation(lang, 'invalidEmailErrorMessage'), { parseMode: 'html' });
          return UserManagement.setState(userId, 0);
        }

        const sendCodeResult = await AuthCodeService.sendEmailVerifyCode(enteredEmail);

        if (sendCodeResult.status) {
          await BotService.sendMessage(userId, getTranslation(lang, 'confirmationPromptText'));
          UserContext.set(userId, 'email', enteredEmail);
          UserManagement.setState(userId, 24);
        } else {
          await BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
          UserManagement.setState(userId, 0);
        }
        break;

      case 24:
        UserManagement.setState(userId, 0);
        const enteredCode = +text.trim();
        const email = UserContext.get(userId, 'email');

        const response = await AuthCodeService.verifyCode(email, enteredCode);

        if (!response.status) {
          if (response.message === 'invalid code') {
            return BotService.sendMessage(userId, getTranslation(lang, 'invalidConfirmationCodeMessage'));
          }

          return BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }

        await BotService.sendMessage(userId, `Личность подтверждена ✅`);

        await User.updateOne(
          { id: userId },
          { $set: { mail: email } }
        );

        await BotService.sendMessage(userId, getTranslation(lang, 'emailChangeSuccessMessage'));
        break;

      case 25:
        const confirmationСode = +text;

        const authCode = await AuthCodeService.verifyCode(user.mail, confirmationСode);

        if (!authCode.status) {
          UserManagement.setState(userId, 0);

          if (authCode.message === 'invalid code') {
            return BotService.sendMessage(userId, getTranslation(lang, 'invalidConfirmationCodeMessage'));
          }

          return BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }

        UserManagement.setState(userId, 23);
        BotService.sendMessage(userId, `Личность подтвержденна ✅`);
        await BotService.sendMessage(userId, getTranslation(lang, 'updateMailPrompt'));
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager settings`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default stateManagerSettings