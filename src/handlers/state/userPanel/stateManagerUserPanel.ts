import { Message } from "telebot";
import BotService from "../../service/telegram/BotService";
import UserManagement from "../../service/user/UserManagement";
import getTranslation, { Language } from "../../translations";
import { UserContext } from "../../context/userContext";
import { minimalSum } from "../../config/minimalSum";
import { ValidatorService } from "../../validator";
import { acceptCancelWithdrawalIK } from "../../keyboards";
import buildWithdrawalSummary from "../../function/buildWithdrawalSummary";
import AuthCodeService from "../../service/mail/AuthCodeService";
import { processWithdrawal } from "../../service/withdraw/processWithdrawal";

async function stateManagerUserPanel(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    const { user, userBalance, userWallet } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language

    switch (state) {
      case 20:
        const coin = UserContext.get(userId, 'coin');

        const userBal = userBalance.main[coin];
        const minAmount = minimalSum[coin];

        const validAmount = await ValidatorService.Withdrawal.validateWithdrawAmount({
          userId,
          coinCode: coin,
          textAmount: text,
          minAmount,
          userBalance: userBal,
          userLang: lang,
          setState: UserManagement.setState
        });

        if (validAmount === null) return;

        UserContext.set(userId, 'amount', validAmount)

        UserManagement.setState(userId, 21);
        BotService.sendMessage(userId, 'Введите адресс кошелька на который хотите вывести деньги: ');
        break;

      case 21:
        UserManagement.setState(userId, 0);
        const amountVal = UserContext.get(userId, 'amount');
        const coinWithdraw = UserContext.get(userId, 'coin')

        UserContext.set(userId, 'userWallet', text);

        const finalMessage = `Сумма вывода вместе с комиссией: ${buildWithdrawalSummary(coinWithdraw, amountVal)}\nАдресс кошелька: ${text}`;

        await BotService.sendMessage(userId, finalMessage, { replyMarkup: acceptCancelWithdrawalIK(lang) });
        break;

      case 22:
        UserManagement.setState(userId, 0);
        const userCode = +text;
        const verifyCode = await AuthCodeService.verifyCode(user.mail, userCode);

        if (!verifyCode.status) {
          const errorKey = verifyCode.message === 'invalid code' ? 'invalidConfirmationCodeMessage' : 'unexpectedError';
          return BotService.sendMessage(userId, getTranslation(lang, errorKey));
        }

        BotService.sendMessage(userId, `Личность подтвержденна ✅`);

        const amountValue = UserContext.get(userId, 'amount');
        const coinCode = UserContext.get(userId, 'coin');
        const toAddress = UserContext.get(userId, 'userWallet');

        await processWithdrawal({
          userId,
          amount: amountValue,
          coin: coinCode,
          address: toAddress
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager user panel`, error);

    UserManagement.setState(userId, 0)
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default stateManagerUserPanel