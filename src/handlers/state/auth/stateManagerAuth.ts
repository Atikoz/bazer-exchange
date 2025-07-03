import { Message } from "telebot";
import getTranslation from "../../../translations";
import TempStateManager from "../../../service/user/TempStateManager";
import { sendError } from "../../../utils/sendError";
import { ValidatorService } from "../../../validator";
import BotService from "../../../service/telegram/BotService";
import AuthCodeService from "../../../service/mail/AuthCodeService";
import { UserContext } from "../../../context/userContext";
import AuthManager from "../../../service/user/AuthManager";
import { RM_Home } from "../../../keyboards";

async function stateManagerAuth(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    const lang = 'eng';

    switch (state) {
      case 80: {
        const enteredEmail = text.trim();

        const isValid = await ValidatorService.User.validateRegisterEnteredEmail(userId, enteredEmail, lang);
        if (!isValid.status) {
          await BotService.sendMessage(userId, isValid.message, { parseMode: 'html' });
          return TempStateManager.setState(userId, 0);
        }

        console.log(enteredEmail)

        const sendCodeResult = await AuthCodeService.sendEmailVerifyCode(enteredEmail);

        if (sendCodeResult.status) {
          await BotService.sendMessage(userId, getTranslation(lang, 'confirmationPromptText'));
          UserContext.set(userId, 'email', enteredEmail);
          TempStateManager.setState(userId, 81);
        } else {
          await BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
          TempStateManager.setState(userId, 0);
        }
        break;
      };

      case 81: {
        TempStateManager.setState(userId, 0);
        const enteredCode = +text.trim();
        const email = UserContext.get(userId, 'email');

        const response = await AuthCodeService.verifyCode(email, enteredCode);

        // if (!response.status) {
        //   if (response.message === 'invalid code') {
        //     return BotService.sendMessage(userId, getTranslation(lang, 'invalidConfirmationCodeMessage'));
        //   }

        //   return BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        // }

        await BotService.sendMessage(userId, getTranslation(lang, 'identityVerified'));
        TempStateManager.setState(userId, 82);
        await BotService.sendMessage(userId, getTranslation(lang, 'enterNewPassword'));
        break;
      }

      case 82: {
        TempStateManager.setState(userId, 0);
        const password = text.trim();
        const email = UserContext.get(userId, 'email');

        const registerRemoteUser = await AuthManager.registerRemoteUser(userId, email, password);

        if (registerRemoteUser.status === 'success' && !registerRemoteUser.error) {
          await AuthManager.loginAndSaveTokens(email, password);
          await BotService.sendMessage(userId, getTranslation(lang, 'registrationIsComplete'), { replyMarkup: RM_Home(lang) });
        } else {
          throw new Error(`Registration request failed: ${registerRemoteUser.error}`);
        }
        break;
      }

      case 84: {
        const enteredEmail = text.trim();

        const isValid = ValidatorService.User.isValidEmail(enteredEmail);
        if (!isValid) {
          await BotService.sendMessage(userId, getTranslation(lang, 'invalidEmailErrorMessage'), { parseMode: 'html' });
          return TempStateManager.setState(userId, 0);
        }

        UserContext.set(userId, 'email', enteredEmail);
        TempStateManager.setState(userId, 85);
        await BotService.sendMessage(userId, getTranslation(lang, 'enterPassword'));
        break;
      }

      case 85: {
        const password = text.trim();
        const email = UserContext.get(userId, 'email');

        const verifyRemoteCredentials = await AuthManager.verifyRemoteCredentials(email, password, lang);

        if (!verifyRemoteCredentials.status) {
          TempStateManager.setState(userId, 0);
          BotService.sendMessage(userId, verifyRemoteCredentials.errorMessage);
          return
        }

        const sendCodeResult = await AuthCodeService.sendEmailVerifyCode(email);

        if (sendCodeResult.status) {
          BotService.sendMessage(userId, getTranslation(lang, 'confirmationPromptText'));
          UserContext.set(userId, 'password', password);
          TempStateManager.setState(userId, 86);
        } else {
          BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
          TempStateManager.setState(userId, 0);
        }
        break;
      }

      case 86: {
        TempStateManager.setState(userId, 0);
        const enteredCode = +text.trim();
        const email = UserContext.get(userId, 'email');
        const password = UserContext.get(userId, 'password');

        const response = await AuthCodeService.verifyCode(email, enteredCode);

        if (!response.status) {
          if (response.message === 'invalid code') {
            return BotService.sendMessage(userId, getTranslation(lang, 'invalidConfirmationCodeMessage'));
          }

          return BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }

        await AuthManager.loginAndSaveTokens(email, password);
        await BotService.sendMessage(userId, getTranslation(lang, 'loginIsComplete'), { replyMarkup: RM_Home(lang) });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    sendError(userId, error as Error, `Error in stateManager Auth (state - ${state}):`);
  }

}

export default stateManagerAuth