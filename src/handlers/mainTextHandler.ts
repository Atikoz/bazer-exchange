import TeleBot, { Message } from 'telebot';
import UserManagment from '../service/user/UserManagement';
import checkUserSubscription from '../service/telegram/SubscribeService';
import BotService from '../service/telegram/BotService';
import getTranslation, { Language } from '../translations';
import { bazerStackingIK, buyCashbscIK, buyDelForRubIK, cabinetIK, exchangeIK, instructionsMenuIK, poolMenuIK, RM_Home, RM_Trade, settingsIK, spotOrderMenu, typeP2P } from '../keyboards';
import AuthFallback from '../service/user/AuthFallback';
import UserManagement from '../service/user/UserManagement';
import BalanceService from '../service/balance/BalanceService';
import { UserContext } from '../context/userContext';
import RateAggregator from '../service/rate/RateAggregator';
import trimNumber from '../utils/trimNumber';
import mainStateHandler from './state/mainStateHandler';

const APP_ENV = process.env.APP_ENV;


export const textHandler = async (msg: Message) => {
  if (msg.chat.type !== 'private') {
    return;
  }

  const userId = msg.from?.id;
  const text = msg.text?.trim();
  const userName = msg.from?.first_name || 'User';
  const { status, user, userBalance, userWallet } = await UserManagment.getInfoUser(userId);
  const selectedLang: Language = (user?.lang as Language) || 'eng';

  if (!userId || !text) {
    return;
  }

  // if (APP_ENV === 'prod') {
  //   const checkUserSubscribe = await checkUserSubscription(userId);

  //   if (!checkUserSubscribe.status) {
  //     return BotService.sendMessage(userId, `Кажется вы не подписались на эти каналы: \n${checkUserSubscribe.data.join('\n')}`);
  //   }
  // }

  console.log(`Пользопатель ${userId} отправил сообщение: ${text}`);

  if (text === '/start') {
    if (!status) {
      await AuthFallback.register(userId);
      await UserManagment.setState(userId, 23);
      await BotService.sendMessage(userId, `${userName}, ${getTranslation(selectedLang, 'alertFolowChannel')}`, { replyMarkup: RM_Home(selectedLang) });
      await BotService.sendMessage(userId, `${userName}, ${getTranslation(selectedLang, 'alertInputEmail')}`, { replyMarkup: RM_Home(selectedLang) });
    } else {
      await UserManagment.setState(userId, 0);
      await BotService.sendMessage(userId, `${getTranslation(selectedLang, 'startText')}, ${userName}!`, { replyMarkup: RM_Home(selectedLang) }).catch((error) => console.log(error));
    }
    return;
  }

  if (!msg.from.username) {
    return BotService.sendMessage(userId, getTranslation(selectedLang, 'alertUnknownUserName'));
  }

  switch (text) {
    case getTranslation(selectedLang, "myAccount"):
      UserManagement.setState(userId, 0);

      const userMail = user.mail
        ? `<code>${user.mail}</code>`
        : getTranslation(selectedLang, 'notSpecified');

      const quantytyCoin = Object.keys(userBalance.main).length;

      await BotService.sendMessage(userId, getTranslation(selectedLang, 'myAccountText'))
        .then(() => BotService.sendMessage(userId, `${getTranslation(selectedLang, 'name')} ${userName}\n🆔 ID: ${userId}\n✉️ Email: ${userMail}\n${getTranslation(selectedLang, 'status')}...\n${getTranslation(selectedLang, 'quantytyCoin')} ${quantytyCoin}`, { replyMarkup: cabinetIK(selectedLang), parseMode: 'html' }));
      break;

    case getTranslation(selectedLang, "spotTrading"):
      UserManagement.setState(userId, 0);
      BotService.sendMessage(userId, getTranslation(selectedLang, 'chooseSectionText'), { replyMarkup: spotOrderMenu(selectedLang) });
      break;

    case 'P2P':
      UserManagement.setState(userId, 0);
      BotService.sendMessage(userId, getTranslation(selectedLang, 'p2pTypeText'), { replyMarkup: typeP2P(selectedLang) });
      break;

    case getTranslation(selectedLang, "referrals"):
      UserManagement.setState(userId, 0);
      BotService.sendMessage(userId, getTranslation(selectedLang, 'referralsText'));
      break;

    case getTranslation(selectedLang, "converting"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'convertingMenuText'), { replyMarkup: exchangeIK })
      break;

    case getTranslation(selectedLang, "staking"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'stakingText'), { replyMarkup: bazerStackingIK });
      break;

    case getTranslation(selectedLang, "settings"):
      BotService.sendMessage(userId, getTranslation(selectedLang, "settingsMenu"), { replyMarkup: settingsIK(selectedLang) });
      break;

    case getTranslation(selectedLang, "instructions"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'instructionsMenu'), { replyMarkup: instructionsMenuIK(selectedLang) });
      break;

    case getTranslation(selectedLang, 'purchasingBazerHub'):
      UserManagement.setState(userId, 30);
      const userBalanceComissionCoin = await BalanceService.getBalance(userId, 'cashbsc');
      UserContext.set(userId, 'balanceComissionCoin', userBalanceComissionCoin);

      const rateCoins = await RateAggregator.getCoinRate('cashbsc', 'bazerhub');
      UserContext.set(userId, 'rateCoins', rateCoins);

      BotService.sendMessage(userId, `<b>${getTranslation(selectedLang, 'minimalAmountBuyBazerHub')}!</b> ${getTranslation(selectedLang, 'rate')}: 1 CASHBSC ≈ <code>${rateCoins.toFixed(9)}</code> BAZERHUB. ${getTranslation(selectedLang, 'available')}: ${trimNumber(userBalanceComissionCoin)} CASHBSC. ${getTranslation(selectedLang, 'coinSaleAmountPrompt')}`, { parseMode: 'html' });
      break;

    case getTranslation(selectedLang, "tradeButton"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'chooseSection'), { replyMarkup: RM_Trade(selectedLang) });
      break;

    case getTranslation(selectedLang, "mainMenuButton"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'mainMenuText'), { replyMarkup: RM_Home(selectedLang) })
      break;


    case getTranslation(selectedLang, "buyDelForRub"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'chooseSection'), { replyMarkup: buyDelForRubIK(selectedLang) });
      break;

    case getTranslation(selectedLang, "buyCashbsc"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'textBuyCashbsc'), { replyMarkup: buyCashbscIK(selectedLang) });
      break;

    case getTranslation(selectedLang, "pools"):
      BotService.sendMessage(userId, getTranslation(selectedLang, 'chooseSectionText'), { replyMarkup: poolMenuIK(selectedLang) });
      break;

    default:
      break;
  };

  if (!status) {
    return
  }

  const state = user.status;
  console.log(`пользователь ${userId} на ${state} стейте`);

  await mainStateHandler(msg, state)
}