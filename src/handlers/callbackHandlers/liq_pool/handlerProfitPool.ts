import { Message } from "telebot";
import BotService from "../../../service/telegram/BotService";
import { parseAction } from "../../../utils/parseAction";
import { Language } from "../../../translations";
import UserManagement from "../../../service/user/UserManagement";
import ProfitPool from "../../../models/user/ProfitPoolModel";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { bot } from "../../../bot";
import { cancelButton, RM_Home } from "../../../keyboards";
import trimNumber from "../../../utils/trimNumber";
import { poolProfitManagement } from "../../../service/balance/ProfitPoolService";
import BalanceService from "../../../service/balance/BalanceService";
import { UserContext } from "../../../context/userContext";

async function handlerProfitPool(msg: Message) {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user, userBalance } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'profitLiquidityPools':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const userProfit = await ProfitPool.findOne({ id: userId });

        if (!userProfit) {
          return BotService.sendMessage(userId, 'Не удалось получить информацию о прибыли. Пожалуйста, попробуйте позже.');
        }

        const balanceProfit = trimNumber(userProfit.profit);
        const currency = SpotTradeFeeCalculator.commissionCoin.toUpperCase();

        const message = `Введите сумму снятия прибыли из пулов ликвидности (доступно ${balanceProfit} ${currency}):`;

        await bot.sendMessage(userId, message, { replyMarkup: cancelButton });
        UserManagement.setState(userId, 55);
        break;

      case 'withdrawPoolProfit':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          BotService.sendMessage(userId, 'Операция отменена ❌\nВы в главном меню.', { replyMarkup: RM_Home(lang) });
          return
        }

        const amount = UserContext.get(userId, 'amountWithdrawAmountProfitPool');

        await poolProfitManagement(userId, -amount);
        await BalanceService.updateBalance(userId, SpotTradeFeeCalculator.commissionCoin, amount);

        await BotService.sendMessage(userId, `Вы успешно вывели ${amount} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()} из пулов ликвидности. Средства успешно начислены на ваш баланс.`);
        await BotService.sendLog(`Пользователь ${userId} вывел прибыль из пулов ликвидности в размере ${amount} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`)
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler profit pool: `, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handlerProfitPool