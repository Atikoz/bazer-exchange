import { Message } from "telebot";
import BotService from "../../../service/telegram/BotService";
import UserManagement from "../../../service/user/UserManagement";
import getTranslation, { Language } from "../../../translations";
import { parseAction } from "../../../utils/parseAction";
import { bot } from "../../../bot";
import trimNumber from "../../../utils/trimNumber";
import { balanceIK, instructionsLiuidityPoolMenuIK, RM_Home } from "../../../keyboards";
import paginateCoinList from "../../../utils/pagination/paginateCoinList";
import { generatePaginatedKeyboard } from "../../../keyboards/generators/generatePaginatedKeyboard";
import { minimalSum } from "../../../config/minimalSum";
import { getWalletByCoin } from "../../../function/getWalletByCoin";
import { UserWallet } from "../../../interface/UserWallet";
import { withdrawalConfigs } from "../../../config/withdrawal/withdrawalConfig";
import { UserContext } from "../../../context/userContext";
import AuthCodeService from "../../../service/mail/AuthCodeService";
import { instructionLinks } from "../../../config/instructionLinks";

export const handlerUserPanel = async (msg: Message) => {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user, userBalance, userWallet } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'balance':
        const coinsPerPage = 20;
        const entries = Object.entries(userBalance.main)
          .filter(([, value]) => typeof value === 'number');

        const totalPages = Math.ceil(entries.length / coinsPerPage);
        const page = params[0] === 'Page' ? +params[1] : 1;

        const start = (page - 1) * coinsPerPage;
        const end = start + coinsPerPage;

        const pageCoins = entries.slice(start, end);
        const balanceLines = [
          '💵 Балансы:',
          ...pageCoins.map(([coin, value]) => `${coin.toUpperCase()}: ${trimNumber(value)}`)
        ];

        const balanceText = balanceLines.join('\n');

        if (params[0] === 'Page') {
          const page = +params[1];
          bot.editMessageText({ chatId: userId, messageId: messageId }, balanceText, { replyMarkup: balanceIK(page, totalPages) })
        } else {
          bot.editMessageText({ chatId: userId, messageId: messageId }, balanceText, { replyMarkup: balanceIK(page, totalPages) })
        }
        break;

      case 'replenishment':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (!params[0]) {
          const page1 = await paginateCoinList(1);
          await BotService.sendMessage(userId, 'Выберите валюту пополнения: ', { replyMarkup: generatePaginatedKeyboard(page1, 'replenishment', 1) });
          return
        }

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);
          await BotService.sendMessage(userId, 'Выберите валюту пополнения: ', { replyMarkup: generatePaginatedKeyboard(coinArray, 'replenishment', page) });
          return
        }

        const address = getWalletByCoin(params[0], userWallet as UserWallet);

        if (!address) {
          return bot.sendMessage(userId, `Адрес для ${params[0].toUpperCase()} временно недоступен.`);
        }

        if (address === 'disabled') {
          return bot.sendMessage(userId, `Пополнение через <b>${params[0].toUpperCase()}</b> временно недоступно.`, {
            parseMode: 'html',
            replyMarkup: RM_Home(lang),
          });
        }

        const textReplenishment = [
          `Способ пополнения через <b>${data.split('_')[1].toUpperCase()}</b>`,
          'Деньги прийдут в течении 10 минут.',
          `<b>Минимальная сумма пополнения ${minimalSum[params[0]]} ${params[0].toUpperCase()}. В случает пополнения суммы меньшей минимальной деньги не будут зачислены на счет!</b>`,
          'Для пополнение баланса переведите средства на свой адрес ниже:'
        ].join('\n');

        await bot.sendMessage(userId, textReplenishment, { replyMarkup: RM_Home(lang), parseMode: 'html' });
        await bot.sendMessage(userId, `<code>${address}</code>`, { replyMarkup: RM_Home(lang), parseMode: 'html' });
        break;

      case 'withdrawal':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (!params[0]) {
          const page1 = await paginateCoinList(1);
          await BotService.sendMessage(userId, 'Выберите валюту вывода: ', { replyMarkup: generatePaginatedKeyboard(page1, 'withdrawal', 1) });
          return
        }

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);
          await BotService.sendMessage(userId, 'Выберите валюту вывода: ', { replyMarkup: generatePaginatedKeyboard(coinArray, 'withdrawal', page) });
          return
        }

        const config = withdrawalConfigs[params[0]];
        const available = userBalance.main[params[0]];

        if (!config) {
          return bot.sendMessage(
            userId,
            `На данный момент вывод монеты ${params[0].toUpperCase()} недоступен. Приносим свои извинения.`
          );
        }

        UserContext.set(userId, 'coin', params[0])

        const message = [
          `Минимальная сумма вывода ${minimalSum[params[0]]} ${params[0].toUpperCase()}`,
          config.feeText,
          `Доступно: ${available} ${params[0].toUpperCase()}`,
          'Введите сумму вывода:'
        ].join('\n');

        await bot.sendMessage(userId, message, {
          replyMarkup: RM_Home(lang),
          parseMode: 'html'
        });

        UserManagement.setState(userId, config.state);
        break;

      case 'acceptWithdrawal':
        bot.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const sendCodeUser = await AuthCodeService.sendEmailVerifyCode(user.mail);

        if (sendCodeUser.status) {
          UserManagement.setState(userId, 22);
          bot.sendMessage(userId, getTranslation(lang, 'confirmationPromptText'))
        } else {
          bot.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }
        break;

      case 'cancel':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        UserManagement.setState(userId, 0);
        BotService.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home(lang) });
        break;

      case 'instructionsLiquidityPools': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, getTranslation(lang, 'instructionsMenu'), { replyMarkup: instructionsLiuidityPoolMenuIK(lang) });
        break;
      }

      case 'instructionsP2P': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, `${getTranslation(lang, 'textSendingInstructions')}\n${instructionLinks[action]}`);
        break;
      }

      case 'instructionsSpotTrade': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, `${getTranslation(lang, 'textSendingInstructions')}\n${instructionLinks[action]}`);
        break;
      }

      case 'instructionsInvestInLiqPool': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        await Promise.all([
          BotService.sendMessage(userId, `${getTranslation(lang, 'textSendingInstructions')}\n${instructionLinks[action][0]}`),
          BotService.sendMessage(userId, instructionLinks[action][1])
        ]);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler user panel`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
};