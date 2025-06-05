import { Message } from "telebot";
import UserManagement from "../../../service/user/UserManagement";
import BotService from "../../../service/telegram/BotService";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { CHOICE } from "../../../utils/constans";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { ValidatorService } from "../../../validator";
import { UserContext } from "../../../context/userContext";

async function stateManagerProfitPool(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    switch (state) {
      case 55:
        UserManagement.setState(userId, 0);
        const validationProfitPool = await ValidatorService.Pool.validateWithdrawPoolProfit(userId, +text);

        if (!validationProfitPool.status) {
          return BotService.sendMessage(userId, validationProfitPool.message);
        }

        UserContext.set(userId, 'amountWithdrawAmountProfitPool', +text);

        await BotService.sendMessage(userId, `Выполнить вывод прибыли из пулов ликвидности в размере ${+text} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}?`, { replyMarkup: generateButton(CHOICE, 'withdrawPoolProfit') });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager profit pool: `, error)
  }
}

export default stateManagerProfitPool