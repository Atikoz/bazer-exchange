import { Message } from "telebot";
import UserManagement from "../../service/user/UserManagement";
import { Language } from "../../translations";
import { UserContext } from "../../context/userContext";
import BotService from "../../service/telegram/BotService";
import { CHOICE } from "../../utils/constans";
import { generateButton } from "../../keyboards/generators/generateButton";
import { ValidatorService } from "../../validator";

async function stateManagerBuyBazerhub(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language

    switch (state) {
      case 30:
        UserManagement.setState(userId, 0);
        const amount = +text;
        const rateCoins = UserContext.get(userId, 'rateCoins');
        const validDataBuyReward = await ValidatorService.User.validateAmountInput(userId, amount, 'cashbsc');

        if (!validDataBuyReward.success) {
          BotService.sendMessage(userId, validDataBuyReward.message);
          return
        }

        UserContext.set(userId, 'amount', amount)

        if (amount < 500) {
          BotService.sendMessage(userId, 'Минимальная сумма покупки на 500 CASHBSC!');
          return
        }

        const numberCoinsReceived = amount * rateCoins;

        BotService.sendMessage(userId, `${amount} CASHBSC ≈ ${numberCoinsReceived.toFixed(9)} BAZERHUB. Желаете продолжить?`, { replyMarkup: generateButton(CHOICE, 'buyBazerhub') });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager buy Bazerhub`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default stateManagerBuyBazerhub;