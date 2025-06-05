import { Message } from "telebot";
import BotService from "../../../service/telegram/BotService";
import UserManagement from "../../../service/user/UserManagement";
import getTranslation, { Language } from "../../../translations";
import { UserContext } from "../../../context/userContext";
import { ValidatorService } from "../../../validator";
import RateAggregator from "../../../service/rate/RateAggregator";
import { generateOrderNumberP2P } from "../../../service/p2p/OrderService";
import { getP2POrderPreviewText } from "../../../utils/formatters/OrderUtils";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { buyerPayOrder, CHOICE } from "../../../utils/constans";
import AuthCodeService from "../../../service/mail/AuthCodeService";
import BalanceService from "../../../service/balance/BalanceService";
import CustomP2POrder from "../../../models/p2p/modelP2POrder";
import { RM_Home } from "../../../keyboards";
import trimNumber from "../../../utils/trimNumber";
import OrderFilling from "../../../models/spotTrade/modelOrderFilling";


async function stateManagerP2P(msg: Message, state: number) {
  const userId = msg.from.id;
  const text = msg.text;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language

    switch (state) {
      case 60:
        UserManagement.setState(userId, 61);
        UserContext.set(userId, 'requisites', +text);

        const selectedCoinUser = UserContext.get(userId, 'coinP2P');
        const availableAmountCoins = await BalanceService.getBalance(userId, selectedCoinUser);

        BotService.sendMessage(userId, `${getTranslation(lang, 'coinSaleAmountPrompt')}. ${getTranslation(lang, 'available')} <code>${trimNumber(availableAmountCoins)}</code> ${selectedCoinUser.toUpperCase()}`);
        break;

      case 61:
        const numericAmount = +text;
        const selectedUserCoin = UserContext.get(userId, 'coinP2P');
        const orderType = UserContext.get(userId, 'typeOrderP2P');

        if (orderType === 'buy') {
          BotService.sendMessage(userId, getTranslation(lang, 'minimumPurchaseAmountBuyPrompt'));
        } else {
          const validateAmount = await ValidatorService.User.validateAmountInput(userId, numericAmount, selectedUserCoin);

          if (!validateAmount.success) {
            UserManagement.setState(userId, 0);
            BotService.sendMessage(userId, validateAmount.message);
            return
          }
          BotService.sendMessage(userId, getTranslation(lang, 'minimumPurchaseAmountSellPrompt'));
        }

        UserContext.set(userId, 'amountP2P', numericAmount);
        UserManagement.setState(userId, 62);
        break;

      case 62:
        const minAmount = UserContext.get(userId, 'amountP2P');
        const orderTypeP2P = UserContext.get(userId, 'typeOrderP2P');
        const validateAmount = ValidatorService.P2P.validateMinTradeAmount(+text, minAmount, orderTypeP2P, lang);

        if (!validateAmount.success) {
          UserManagement.setState(userId, 0);
          BotService.sendMessage(userId, validateAmount.message);
          return
        }

        UserManagement.setState(userId, 63);

        UserContext.set(userId, 'minSellAmountP2P', +text);

        const selectedCoin = UserContext.get(userId, 'coinP2P');
        const selectedCurrency = UserContext.get(userId, 'currencyP2P');
        const rateStockExchange = await RateAggregator.getCurrencyRate(selectedCoin, selectedCurrency);

        const rateMessage = orderTypeP2P === 'buy'
          ? getTranslation(lang, 'purchaseBuyCoinRate')
          : getTranslation(lang, 'purchaseSellCoinRate');

        await BotService.sendMessage(
          userId,
          `${getTranslation(lang, 'exchangeRate')} 1 ${selectedCoin} ≈ <code>${rateStockExchange}</code> ${selectedCurrency}. ${rateMessage} <i>0.0001</i>:`,
          { parseMode: 'html' }
        );
        break;

      case 63:
        UserManagement.setState(userId, 0);

        const validateRate = ValidatorService.P2P.validateEnteredUserRate(+text, lang);

        if (!validateRate.success) {
          BotService.sendMessage(userId, validateRate.message);
          return
        }

        const orderNumber = await generateOrderNumberP2P();
        UserContext.set(userId, 'orderNumber', orderNumber);
        UserContext.set(userId, 'userRateP2P', +text);
        const {
          typeOrderP2P,
          coinP2P,
          currencyP2P,
          requisites,
          amountP2P,
          minSellAmountP2P,
          paymentSystemP2P,
        } = UserContext.getMany(userId, [
          'typeOrderP2P',
          'coinP2P',
          'currencyP2P',
          'requisites',
          'amountP2P',
          'minSellAmountP2P',
          'paymentSystemP2P',
        ]);

        const previewText = getP2POrderPreviewText(typeOrderP2P, lang, {
          orderNumber: orderNumber,
          coin: coinP2P,
          amount: amountP2P,
          minimalAmountSell: minSellAmountP2P,
          currency: currencyP2P,
          paymentSystem: paymentSystemP2P,
          rate: +text,
          requisites: requisites,
        });

        await BotService.sendMessage(userId, previewText, { replyMarkup: generateButton(CHOICE, 'createOrderP2P'), parseMode: 'html' });
        break;

      case 64:
        UserManagement.setState(userId, 0);
        const confirmationСode = +text;
        const authCode = await AuthCodeService.verifyCode(user.mail, confirmationСode);

        if (!authCode.status) {
          if (authCode.message === 'invalid code') {
            return BotService.sendMessage(userId, getTranslation(lang, 'invalidConfirmationCodeMessage'));
          }

          return BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }

        BotService.sendMessage(userId, 'Личность подтверждена ✅');

        const {
          typeOrderP2P: typeOrder,
          orderNumber: orderNumberP2P,
          userRateP2P: userRate,
          coinP2P: coin,
          currencyP2P: currency,
          requisites: requisitesP2P,
          amountP2P: amount,
          minSellAmountP2P: minSellAmount,
          paymentSystemP2P: paymentSystem,
        } = UserContext.getMany(userId, [
          'typeOrderP2P',
          'orderNumber',
          'userRateP2P',
          'coinP2P',
          'currencyP2P',
          'requisites',
          'amountP2P',
          'minSellAmountP2P',
          'paymentSystemP2P',
        ]);

        const orderData = {
          id: userId,
          orderNumber: orderNumberP2P,
          type: typeOrder,
          status: 'Selling',
          coin: coin,
          currency,
          amount,
          rate: userRate,
          minAmount: minSellAmount,
          paymentSystem,
          requisites: requisitesP2P
        };

        await CustomP2POrder.create(orderData);
        await BalanceService.freeze(userId, orderData.amount, orderData.coin);
        const logMsg = [
          `Пользователь ${userId} создал P2P ордер на продажу №${orderData.orderNumber}.`,
          `Данные ордера:`,
          `Ордер № ${orderData.orderNumber}`,
          `Тип ордера: Продать`,
          `Продажа монеты: ${orderData.coin.toUpperCase()}`,
          `Количество продажи: ${orderData.amount} ${orderData.coin.toUpperCase()}`,
          `Минимальная сумма продажи: ${orderData.minAmount} ${orderData.coin.toUpperCase()}`,
          `Валюта: ${orderData.currency.toUpperCase()}`,
          `Способ оплаты: ${orderData.paymentSystem}`,
          `Курс продажи: ${orderData.rate} ${orderData.currency.toUpperCase()}`
        ].join('\n');

        await BotService.sendMessage(userId, 'Ордер успешно создан ✅', { replyMarkup: RM_Home(lang) });
        await BotService.sendLog(logMsg);
        break;

      case 65: {
        UserManagement.setState(userId, 66);
        const selectedOrder = UserContext.get(userId, 'selectedOrderP2P');

        if (!selectedOrder) {
          UserManagement.setState(userId, 0);
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        if (isNaN(+text)) {
          UserManagement.setState(userId, 0);

          await Promise.all([
            CustomP2POrder.updateOne(
              { orderNumber: selectedOrder.orderNumber },
              { $set: { status: 'Selling' } }
            )
          ]);

          return BotService.sendMessage(userId, 'Введенно не коректное число!');
        };

        UserContext.set(userId, 'requisites', +text);

        await CustomP2POrder.updateOne(
          { orderNumber: selectedOrder.orderNumber },
          { $set: { status: 'Filling' } }
        );

        const { minAmount, amount, coin } = selectedOrder;

        await BotService.sendMessage(
          userId,
          `Лимит ордера: ${minAmount} - ${amount} ${coin.toUpperCase()}.\nВведите количество продажи монеты:`
        );
        break;
      }

      case 66: {
        UserManagement.setState(userId, 0);

        const selectedOrder = UserContext.get(userId, 'selectedOrderP2P');
        if (!selectedOrder) {
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        const requisites = UserContext.get(userId, 'requisites');
        const enteredAmount = Number(text);

        const revertOrder = async (message: string) => {
          await Promise.all([
            CustomP2POrder.updateOne(
              { orderNumber: selectedOrder.orderNumber },
              { $set: { status: 'Selling' } }
            )
          ]);
          return BotService.sendMessage(userId, message);
        };

        const balance = await BalanceService.getBalance(userId, selectedOrder.coin);

        const validationResult = ValidatorService.P2P.validateOrderAmount({
          enteredAmount,
          balance,
          minAmount: selectedOrder.minAmount,
          maxAmount: selectedOrder.amount,
          lang
        });

        if (!validationResult.success) {
          return revertOrder(validationResult.message!);
        }

        UserContext.set(userId, 'amountP2P', enteredAmount);

        await OrderFilling.create({
          orderNumber: selectedOrder.orderNumber,
          status: 'Filling',
          processed: false,
          creatorOrder: selectedOrder.id,
          client: userId,
          rate: selectedOrder.rate,
          coin: selectedOrder.coin,
          currency: selectedOrder.currency,
          coinAmount: enteredAmount,
          currencyAmount: enteredAmount * selectedOrder.rate,
          requisites
        });

        await BotService.sendMessage(
          userId,
          `Выбран ордер №${selectedOrder.orderNumber},
        Количество продажи монеты: ${enteredAmount} ${selectedOrder.coin.toUpperCase()},
        Курс совершения операции: ${selectedOrder.rate} ${selectedOrder.currency.toUpperCase()},
        Способ оплаты: ${selectedOrder.paymentSystem},
        Реквизиты: ${requisites}`,
          { replyMarkup: generateButton(CHOICE, 'p2pSellOrderConfirm') }
        )
        break;
      }

      case 67: {
        UserManagement.setState(userId, 0);
        const codeConfirmation = Number(text);
        const selectedOrder = UserContext.get(userId, 'selectedOrderP2P');

        if (!selectedOrder) {
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        const responseAuthCode = await AuthCodeService.verifyCode(user.mail, codeConfirmation);

        if (responseAuthCode.status) {
          BotService.sendMessage(userId, `Личность подтверждена ✅`);

          const sellOrder = await OrderFilling.findOne({ orderNumber: selectedOrder.orderNumber });
          if (!sellOrder) {
            return BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
          }

          await OrderFilling.updateOne(
            { orderNumber: selectedOrder.orderNumber },
            { $set: { status: "Approve" } }
          );

          await BalanceService.freeze(sellOrder.client, sellOrder.coinAmount, sellOrder.coin);

          await BotService.sendMessage(
            sellOrder.client,
            'Заявка принята, ожидайте зачисления денег на карту...'
          );

          const payInstruction = `Сработал ордер №${sellOrder.orderNumber}.
Сумма покупки: ${sellOrder.coinAmount} ${sellOrder.coin.toUpperCase()} по курсу ${sellOrder.rate} ${sellOrder.currency.toUpperCase()}.
Переведите ${sellOrder.currencyAmount} ${sellOrder.currency.toUpperCase()} на <i><code>${sellOrder.requisites}</code></i> и нажмите кнопку <b>«Done»</b> после перевода.`;

          await BotService.sendMessage(
            sellOrder.creatorOrder,
            payInstruction,
            {
              replyMarkup: generateButton(buyerPayOrder, `p2pSellerConfirm_${sellOrder.orderNumber}`),
              parseMode: 'html'
            }
          );
        } else {
          await Promise.all([
            OrderFilling.deleteOne({ orderNumber: selectedOrder.orderNumber }),
            CustomP2POrder.updateOne(
              { orderNumber: selectedOrder.orderNumber },
              { $set: { status: 'Selling' } }
            )
          ]);

          const errorMessage = responseAuthCode.message === 'invalid code'
            ? getTranslation(lang, 'invalidConfirmationCodeMessage')
            : getTranslation(lang, 'unexpectedError');

          await BotService.sendMessage(userId, errorMessage);
        }
        break;
      }

      case 68: {
        UserManagement.setState(userId, 0);
        const selected = UserContext.get(userId, 'selectedOrderP2P');
        if (!selected) {
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        const enteredAmount = Number(text);

        const revertOrder = async (errorMessage: string) => {
          await Promise.all([
            CustomP2POrder.updateOne(
              { orderNumber: selected.orderNumber },
              { $set: { status: 'Selling' } }
            )
          ]);
          return BotService.sendMessage(userId, errorMessage);
        };

        const validation = ValidatorService.P2P.checkOrderAmountLimits({
          enteredAmount,
          minAmount: selected.minAmount,
          maxAmount: selected.amount,
          lang
        });

        if (!validation.success) {
          return revertOrder(validation.message!);
        }

        await CustomP2POrder.updateOne(
          { orderNumber: selected.orderNumber },
          { $set: { status: 'Filling' } }
        );

        UserContext.set(userId, 'amountP2P', enteredAmount);

        await OrderFilling.create({
          orderNumber: selected.orderNumber,
          status: 'Filling',
          processed: false,
          creatorOrder: selected.id,
          client: userId,
          rate: selected.rate,
          coin: selected.coin,
          currency: selected.currency,
          coinAmount: enteredAmount,
          currencyAmount: enteredAmount * selected.rate,
          requisites: 0
        });

        BotService.sendMessage(
          userId,
          `Выбран ордер №${selected.orderNumber},
Количество покупки: ${enteredAmount} ${selected.coin.toUpperCase()},
Курс совершения операции: ${selected.rate} ${selected.currency.toUpperCase()},
Способ оплаты: ${selected.paymentSystem},
Реквизиты для оплаты: ${selected.requisites}`,
          { replyMarkup: generateButton(CHOICE, 'p2pBuyOrderConfirm') }
        );
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`error state manager p2p`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default stateManagerP2P