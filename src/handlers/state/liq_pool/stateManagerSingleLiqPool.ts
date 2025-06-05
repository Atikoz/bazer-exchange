import { Message } from "telebot";
import UserManagement from "../../../service/user/UserManagement";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { UserContext } from "../../../context/userContext";
import BotService from "../../../service/telegram/BotService";
import { ValidatorService } from "../../../validator";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { CHOICE } from "../../../utils/constans";


async function stateManagerSingleLiqPool(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    switch (state) {
      case 50:
        UserManagement.setState(userId, 0);

        const selectedCoin = UserContext.get(userId, 'selectedWithdrawCoin');

        const investCoin = UserContext.get(userId, 'investCoin');
        const targetCoin = UserContext.get(userId, 'targetCoin');

        const comissionWithdraw = await SpotTradeFeeCalculator.calculateFull(selectedCoin, +text);

        const validationWithdrawPoolInv = await ValidatorService.Pool.validateWithdrawInvestmentSingle({
          firstCoin: investCoin,
          secondCoin: targetCoin,
          coinWithdraw: selectedCoin,
          amount: +text,
          userId,
          commission: comissionWithdraw
        });

        if (!validationWithdrawPoolInv.status) {
          return BotService.sendMessage(userId, validationWithdrawPoolInv.message);
        }

        UserContext.set(userId, 'amountWithdrawSingleLigPool', +text)
        UserContext.set(userId, 'comissionWithdrawSingleLigPool', comissionWithdraw)

        BotService.sendMessage(userId, `Вы хотите вывести средства из пула ликвидности в объеме ${+text} ${selectedCoin.toUpperCase()}. Комиссия составляет ${comissionWithdraw} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`, { replyMarkup: generateButton(CHOICE, 'withdrawInvestPool') })
        break;

      case 51:
        UserManagement.setState(userId, 0);
        const firstCoin = UserContext.get(userId, 'firstCoinSinglePool');
        const secondCoin = UserContext.get(userId, 'secondCoinSinglePool');
        const comissionInvestment = await SpotTradeFeeCalculator.calculateFull(firstCoin, +text)
        const isValidPoolData = await ValidatorService.Pool.validatePoolData(userId, +text, firstCoin, comissionInvestment);

        if (!isValidPoolData.status) {
          return BotService.sendMessage(userId, isValidPoolData.message);
        }

        UserContext.set(userId, 'amountInvestSinglePool', +text);
        UserContext.set(userId, 'comissionInvestmentInSinglePool', comissionInvestment);

        const createPoolMesg = `Торговля осуществляется по рыночной цене. Проскальзывание составляет 5%.
        Пара: ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()},
        Количество монет для пула: ${+text} ${firstCoin.toUpperCase()}.
        Комиссия: ${comissionInvestment} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`;

        BotService.sendMessage(userId, createPoolMesg, { replyMarkup: generateButton(CHOICE, 'createPool') });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager single liq pool: `, error);
  }
}

export default stateManagerSingleLiqPool;
