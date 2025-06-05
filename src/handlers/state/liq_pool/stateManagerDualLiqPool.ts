import { Message } from "telebot";
import UserManagement from "../../../service/user/UserManagement";
import { UserContext } from "../../../context/userContext";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import BotService from "../../../service/telegram/BotService";
import { ValidatorService } from "../../../validator";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { CHOICE } from "../../../utils/constans";


async function stateManagerDualLiqPool(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    switch (state) {
      case 40:
        UserManagement.setState(userId, 0);
        UserContext.set(userId, 'amount', +text);

        const firstCoinDualPool = UserContext.get(userId, 'firstCoinDualPool') as string;
        const secondCoinDualPool = UserContext.get(userId, 'secondCoinDualPool') as string;
        const selectedInvestCoin = UserContext.get(userId, 'selectedInvestCoinDualLiqPool') as string;
        const comissionInvestment = await SpotTradeFeeCalculator.calculateFull(selectedInvestCoin, +text);

        const isValidPoolData = await ValidatorService.Pool.validatePoolData(userId, +text, selectedInvestCoin, comissionInvestment);

        if (!isValidPoolData.status) {
          return BotService.sendMessage(userId, isValidPoolData.message);
        }

        UserContext.set(userId, 'comissionInvestmentInDualPool', comissionInvestment);

        const createPoolMesg = `Торговля осуществляется по рыночной цене. Проскальзывание составляет 5%.
        Пара: ${firstCoinDualPool.toUpperCase()}/${secondCoinDualPool.toUpperCase()},
        Количество монет для пула: ${text} ${selectedInvestCoin.toUpperCase()}.
        Комиссия: ${comissionInvestment} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`;

        BotService.sendMessage(userId, createPoolMesg, { replyMarkup: generateButton(CHOICE, 'createDualPool') });
        break;

      case 41:
        UserManagement.setState(userId, 0);
        const userAmount = +text;

        const firstCoinSelectedPool = UserContext.get(userId, 'firstCoinSelectedPool') as string;
        const secondCoinSelectedPool = UserContext.get(userId, 'secondCoinSelectedPool') as string;
        const selectedWithdrawCoin = UserContext.get(userId, 'selectedWithdrawCoinDuobleLiqPool') as string;

        const commissionWithdrawCoin = await SpotTradeFeeCalculator.calculateFull(selectedWithdrawCoin, userAmount);

        const validationWithdrawPoolInv = await ValidatorService.Pool.validateWithdrawInvestmentDual({
          firstCoin: firstCoinSelectedPool,
          secondCoin: secondCoinSelectedPool,
          coinWithdraw: selectedWithdrawCoin,
          amount: userAmount,
          userId: userId,
          commission: commissionWithdrawCoin
        });

        if (!validationWithdrawPoolInv.status) {
          return BotService.sendMessage(userId, validationWithdrawPoolInv.message);
        }
        UserContext.set(userId, 'amount', userAmount);
        UserContext.set(userId, 'commissionWithdrawCoin', commissionWithdrawCoin);

        BotService.sendMessage(userId, `Вы хотите вывести средства из пула ликвидности в объеме ${userAmount} ${selectedWithdrawCoin.toUpperCase()}. Комиссия составляет ${commissionWithdrawCoin} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`, { replyMarkup: generateButton(CHOICE, 'withdrawInvestDualPool') })
        break;

      case 42:
        UserManagement.setState(userId, 0);
        UserContext.set(userId, 'amount', +text);

        const firstCoin = UserContext.get(userId, 'firstCoinDualPool') as string;
        const secondCoin = UserContext.get(userId, 'secondCoinDualPool') as string;
        const selectedInvestCoinDualPool = UserContext.get(userId, 'selectedInvestCoinDualLiqPool') as string;
        const comissionInvestmentDualPool = await SpotTradeFeeCalculator.calculateFull(selectedInvestCoinDualPool, +text);

        const isValidDoublePoolData = await ValidatorService.Pool.validatePoolData(userId, +text, selectedInvestCoinDualPool, comissionInvestmentDualPool);

        if (!isValidDoublePoolData.status) {
          return BotService.sendMessage(userId, isValidDoublePoolData.message);
        }

        UserContext.set(userId, 'comissionInvestmentInDualPool', comissionInvestmentDualPool);

        const investPoolMesg = `Торговля осуществляется по рыночной цене. Проскальзывание составляет 5%.
        Пара: ${firstCoin.toUpperCase()}/${secondCoin.toUpperCase()},
        Количество монет для пула: ${text} ${selectedInvestCoinDualPool.toUpperCase()}.
        Комиссия: ${comissionInvestmentDualPool} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`;

        BotService.sendMessage(userId, investPoolMesg, { replyMarkup: generateButton(CHOICE, 'investDualPool') });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager dual liq pool: `, error);
  }
}

export default stateManagerDualLiqPool;