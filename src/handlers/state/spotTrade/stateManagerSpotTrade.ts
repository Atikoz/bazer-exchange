import { Message } from "telebot";
import BotService from "../../../service/telegram/BotService";
import getTranslation, { Language } from "../../../translations";
import UserManagement from "../../../service/user/UserManagement";
import { ValidatorService } from "../../../validator";
import { UserContext } from "../../../context/userContext";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import trimNumber from "../../../utils/trimNumber";
import Big from "big.js";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { CHOICE } from "../../../utils/constans";
import BalanceService from "../../../service/balance/BalanceService";


async function stateManagerSpotTrade(msg: Message, state: number) {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language

    switch (state) {
      case 70: {
        UserManagement.setState(userId, 0);
        const tradeAmount = +text;
        const { sellCoinSpotTrade, buyCoinSpotTrade, maxOrderAmountSpotTrade, rate } = UserContext.getMany(userId, [
          'sellCoinSpotTrade',
          'buyCoinSpotTrade',
          'maxOrderAmountSpotTrade',
          'rate'
        ]);

        const validateResult = await ValidatorService.SpotTrade.validateTradeAmount(userId, tradeAmount, maxOrderAmountSpotTrade, sellCoinSpotTrade);
        if (!validateResult.status) {
          return BotService.sendMessage(userId, validateResult.message);
        }

        const commissionTrade = await SpotTradeFeeCalculator.calculateFull(sellCoinSpotTrade, tradeAmount);

        const validateComission = await ValidatorService.SpotTrade.validateComission(userId, commissionTrade);
        if (!validateComission.status) {
          return BotService.sendMessage(userId, validateComission.message);
        }

        const buyAmount = Big(tradeAmount).times(rate);
        const formattedBuyAmount = trimNumber(+buyAmount);

        UserContext.setMany(userId, {
          buyAmountSpotTrade: formattedBuyAmount,
          commissionSpotTrade: commissionTrade,
          tradeAmountSpotTrade: tradeAmount
        });

        const msg = `Продажа монеты: ${sellCoinSpotTrade.toUpperCase()},
Покупка монеты: ${buyCoinSpotTrade.toUpperCase()},
Курс продажи: 1 ${sellCoinSpotTrade.toUpperCase()} = ${rate} ${buyCoinSpotTrade.toUpperCase()},
Количество продажи: ${tradeAmount} ${sellCoinSpotTrade.toUpperCase()},
Количество покупки: ${formattedBuyAmount} ${buyCoinSpotTrade.toUpperCase()},
Комиссия сделки: ${commissionTrade} ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.`;

        await BotService.sendMessage(userId, msg, { replyMarkup: generateButton(CHOICE, 'createSpotOrder') });
        break;
      }

      case 71: {
        UserManagement.setState(userId, 72);

        const enteredRate = trimNumber(Number(text));
        if (isNaN(enteredRate)) {
          UserManagement.setState(userId, 0);
          return BotService.sendMessage(
            userId,
            getTranslation(lang, 'incorrectRateMessage'),
            { parseMode: 'html' }
          );
        }

        UserContext.set(userId, 'rate', enteredRate);

        const sellCoin = UserContext.get(userId, 'sellCoinSpotTrade')
        const balanceUser = await BalanceService.getBalance(userId, sellCoin) || 0;
        const sellCoinSymbol = sellCoin.toUpperCase();

        const message = `${getTranslation(lang, 'available')} ${balanceUser} ${sellCoinSymbol}.
${getTranslation(lang, 'coinSaleAmountPrompt')}`;

        await BotService.sendMessage(userId, message);
        break;
      }

      case 72: {
        UserManagement.setState(userId, 0);

        const saleAmount = +text;
        const { sellCoinSpotTrade, buyCoinSpotTrade, rate } = UserContext.getMany(userId, [
          'sellCoinSpotTrade',
          'buyCoinSpotTrade',
          'rate'
        ]);

        const commission = await SpotTradeFeeCalculator.calculateFull(sellCoinSpotTrade, saleAmount);

        const validateResult = await ValidatorService.SpotTrade.validateSellAmount(userId, saleAmount, commission, sellCoinSpotTrade, lang);
        if (!validateResult.status) {
          return BotService.sendMessage(userId, validateResult.message);
        }

        const buyAmount = Big(saleAmount).times(rate);
        const formattedBuyAmount = trimNumber(+buyAmount);

        UserContext.setMany(userId, {
          commissionSpotTrade: commission,
          tradeAmountSpotTrade: saleAmount,
          buyAmountSpotTrade: formattedBuyAmount,
        });

        const sellCoinSymbol = sellCoinSpotTrade.toUpperCase();
        const buyCoinSymbol = buyCoinSpotTrade.toUpperCase();
        const commissionCoinSymbol = SpotTradeFeeCalculator.commissionCoin.toUpperCase();

        const message = `${getTranslation(lang, 'sellCoin')}: ${sellCoinSymbol}
${getTranslation(lang, 'buyCoin')}: ${buyCoinSymbol}
${getTranslation(lang, 'sellingRate')}: 1 ${sellCoinSymbol} = ${rate} ${buyCoinSymbol}
${getTranslation(lang, 'amountToSellData')}: ${saleAmount} ${sellCoinSymbol}
${getTranslation(lang, 'amountToBuyData')}: ${formattedBuyAmount} ${buyCoinSymbol}
${getTranslation(lang, 'transactionFee')}: ${commission} ${commissionCoinSymbol}.`;

        await BotService.sendMessage(userId, message, {
          replyMarkup: generateButton(CHOICE, 'createSpotOrder')
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager spot trade`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default stateManagerSpotTrade