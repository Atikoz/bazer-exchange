import { Message } from "telebot";
import BotService from "../../service/telegram/BotService";
import UserManagement from "../../service/user/UserManagement";
import { ValidatorService } from "../../validator";
import { UserContext } from "../../context/userContext";
import { CHOICE } from "../../utils/constans";
import { generateButton } from "../../keyboards/generators/generateButton";
import MinterService from "../../service/blockchain/minter/minterService";
import User from "../../models/user/UserModel";
const MinterServiceInstance = new MinterService();


async function stateManagerExchangeCoins(msg: Message, state: number): Promise<void> {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    switch (state) {
      case 31:
        UserManagement.setState(userId, 0);
        const sellAmount = +text;
        const sellCoin = UserContext.get(userId, 'sellCoinSwap');
        const buyCoin = UserContext.get(userId, 'buyCoinSwap');
        const validate = await ValidatorService.User.validateAmountInput(userId, sellAmount, sellCoin);

        if (!validate.success) {
          return BotService.sendMessage(userId, validate.message);
        }

        UserContext.set(userId, 'sellAmountSwap', sellAmount);

        BotService.sendMessage(userId, `Вы действительно хотите конвертировать ${sellAmount} ${sellCoin.toUpperCase()} = ${sellAmount} ${buyCoin.toUpperCase()}`, { replyMarkup: generateButton(CHOICE, 'confirmBazerSwap') });
        break;

      case 32:
        UserManagement.setState(userId, 0);
        const amount = +text;
        if (isNaN(amount)) {
          return BotService.sendMessage(userId, 'Введено не корректное число!');
        }

        if (!Number.isInteger(amount)) {
          return BotService.sendMessage(userId, 'Введенное число не является целым!');
        }

        UserContext.set(userId, 'amountExchange', amount);

        const sellCoinMinter = UserContext.get(userId, 'sellCoinExchange')
        const buyCoinMinter = UserContext.get(userId, 'buyCoinExchange')
        const rate = UserContext.get(userId, 'rateExchange');

        const sellCoinId = sellCoinMinter === 'minterBazercoin' ? await MinterServiceInstance.getCoinId('bazercoin') : await MinterServiceInstance.getCoinId(sellCoinMinter);
        const buyCoinId = buyCoinMinter === 'minterBazercoin' ? await MinterServiceInstance.getCoinId('bazercoin') : await MinterServiceInstance.getCoinId(buyCoinMinter);

        const route = await MinterServiceInstance.getRouteExchange(sellCoinId, buyCoinId, amount);
        const numericRoute = route.map(Number);

        UserContext.set(userId, 'routeExchange', numericRoute);

        const fee = await MinterServiceInstance.getFeeExchange(numericRoute, amount);
        if (!fee) {
          return BotService.sendMessage(userId, 'Возникла ошибка, попробуйте попытку позже.');
        }

        UserContext.set(userId, 'feeExchange', fee);

        const validation = await ValidatorService.Minter.exchangeValidator(userId, amount, sellCoinMinter, fee);
        if (!validation.success) {
          return BotService.sendMessage(userId, validation.message);
        }

        const receiveAmount = amount * rate;

        UserContext.set(userId, 'receiveAmountExchange', receiveAmount); 

        const summary = [
          `Курс: 1 ${sellCoinMinter.toUpperCase()} = ${rate} ${buyCoinMinter.toUpperCase()}`,
          `Количество продажи монеты: ${amount.toFixed(4)} ${sellCoinMinter.toUpperCase()}`,
          `Количество покупки монеты: ${receiveAmount.toFixed(4)} ${buyCoinMinter.toUpperCase()}`,
          `Комиссия составляет ${fee} BIP.`
        ].join('\n');

        await BotService.sendMessage(userId, summary, {
          replyMarkup: generateButton(CHOICE, 'confirmMinterExchange')
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager exchange coins`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}
export default stateManagerExchangeCoins
