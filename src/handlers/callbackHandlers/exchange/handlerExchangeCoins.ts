import { Message } from "telebot";
import UserManagement from "../../../service/user/UserManagement";
import getTranslation, { Language } from "../../../translations";
import { parseAction } from "../../../utils/parseAction";
import BotService from "../../../service/telegram/BotService";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { BAZER_COIN_LIST, SHARED_MINTER_COINS } from "../../../utils/constans";
import BalanceService from "../../../service/balance/BalanceService";
import { UserContext } from "../../../context/userContext";
import { RM_Home } from "../../../keyboards";
import trimNumber from "../../../utils/trimNumber";
import RateAggregator from "../../../service/rate/RateAggregator"
import MinterService from "../../../service/blockchain/minter/minterService";
const MinterServiceInstance = new MinterService();
const MNEMONIC = process.env.MNEMONIC;


async function handlerExchangeCoins(msg: Message): Promise<void> {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user, userBalance } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'decimalExchange':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'На данный момент конвертацие монет из сети Decimal недоступна. Приносим свои извенения.');
        break;

      case 'minterExchange':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Вы перейшли в раздел конвертации в сети <b>Minter</>.\n<b>Для обмена доступны только целые суммы!</b>. Оплата комисии производится в монете <b>BIP</b>.', { parseMode: 'html' });
        await BotService.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(SHARED_MINTER_COINS, 'selectSellCoinMinterExchange') });
        break;

      case 'selectSellCoinMinterExchange':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const buyOptions = SHARED_MINTER_COINS.filter((coin) => coin !== params[0]);

        UserContext.set(userId, 'sellCoinExchange', params[0]);

        BotService.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(buyOptions, 'selectBuyCoinMinterExchange') });
        break;

      case 'selectBuyCoinMinterExchange':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const sellCoinMinter = UserContext.get(userId, 'sellCoinExchange');
        const buyCoinMinter = params[0];

        const rate = await RateAggregator.getCoinRate(sellCoinMinter, buyCoinMinter);

        if (!rate) {
          BotService.sendMessage(userId, `${getTranslation(lang, 'unexpectedError')}`, { parseMode: 'html' });
          return
        }

        UserContext.set(userId, 'rateExchange', trimNumber(rate));
        const balanceSellCoin = await BalanceService.getBalance(userId, sellCoinMinter);

        UserContext.set(userId, 'buyCoinExchange', buyCoinMinter);

        BotService.sendMessage(userId, `Курс 1 ${sellCoinMinter.toUpperCase()} = ${trimNumber(rate)} ${buyCoinMinter.toUpperCase()}. Введите количество продажи ${sellCoinMinter.toUpperCase()} (доступно ${balanceSellCoin}):`);
        UserManagement.setState(userId, 32);
        break;

      case 'confirmMinterExchange':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          BotService.sendMessage(userId, 'Операция отменена ❌\nВы в главном меню.', { replyMarkup: RM_Home(lang) });
          return;
        }

        const sellCoinExchangeMinter = UserContext.get(userId, 'sellCoinExchange');
        const buyCoinExchangeMinter = UserContext.get(userId, 'buyCoinExchange');
        const amountExchange = UserContext.get(userId, 'amountExchange');
        const routeExchange = UserContext.get(userId, 'routeExchange');
        const fee = UserContext.get(userId, 'feeExchange');
        const receiveAmount = UserContext.get(userId, 'receiveAmountExchange');

        const exchange = await MinterServiceInstance.exchangeMinterTransaction(routeExchange, amountExchange, MNEMONIC);

        if (!exchange.status) {
          return BotService.sendMessage(userId, 'Возникла непредвиденная ошибка! Сообщите администрации.', { parseMode: 'html' });
        }

        await BotService.sendMessage(userId, `Обмен произошел успешно!\nTxHash: <code>${exchange.data.hash}</code>`, { parseMode: 'html' });
        await BalanceService.updateBalance(userId, sellCoinExchangeMinter, -amountExchange);
        await BalanceService.updateBalance(userId, buyCoinExchangeMinter, receiveAmount);
        await BalanceService.updateBalance(userId, 'bip', -fee);

        await BotService.sendLog(`Пользователь ${userId} конвертировал монеты из сети Minter.\nTxHash: <code>${exchange.data.hash}</code>`)
        break;

      case 'bazerExchange':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        await BotService.sendMessage(
          userId,
          `Вы перешли в раздел конвертации в сети <b>Bazer</b>.\nОплата комисии производится в монете <b>${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}</b>.`,
          { parseMode: 'html' }
        );

        await BotService.sendMessage(
          userId,
          'Выберите монету которую хотите продать:',
          { replyMarkup: generateButton(BAZER_COIN_LIST, 'selectCoinBazerSwap') }
        );
        break;

      case 'selectCoinBazerSwap':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const selectedSellCoin = params[0];
        const selectedBuyCoin = BAZER_COIN_LIST.find(c => c !== selectedSellCoin);

        UserContext.set(userId, 'sellCoinSwap', selectedSellCoin);
        UserContext.set(userId, 'buyCoinSwap', selectedBuyCoin);

        const balanceUserCoin = await BalanceService.getBalance(userId, selectedSellCoin)
        BotService.sendMessage(userId,
          `Курс пары обмена 1 ${selectedSellCoin.toUpperCase()} = 1 ${selectedBuyCoin.toUpperCase()}\nДоступно для обмена: ${balanceUserCoin}`);

        await BotService.sendMessage(userId, 'Введите количество конвертации монет:');
        UserManagement.setState(userId, 31);
        break;

      case 'confirmBazerSwap':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          BotService.sendMessage(userId, 'Операция отменена ❌\nВы в главном меню.', { replyMarkup: RM_Home(lang) });
          return
        }

        const sellAmount = UserContext.get(userId, 'sellAmountSwap');
        const sellCoin = UserContext.get(userId, 'sellCoinSwap');
        const buyCoin = UserContext.get(userId, 'buyCoinSwap');

        await BalanceService.updateBalance(userId, sellCoin, -sellAmount);
        await BalanceService.updateBalance(userId, buyCoin, sellAmount);

        BotService.sendMessage(userId, `Вы успешно обменяли ${sellAmount} ${sellCoin.toUpperCase()} = ${sellAmount} ${buyCoin.toUpperCase()}`);
        BotService.sendLog(`Пользователь ${userId} успешно обменял ${sellAmount} ${sellCoin.toUpperCase()} = ${sellAmount} ${buyCoin.toUpperCase()}`);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler exchange coins: `, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handlerExchangeCoins;