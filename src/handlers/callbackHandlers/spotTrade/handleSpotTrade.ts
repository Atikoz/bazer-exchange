import { Message } from "telebot";
import { parseAction } from "../../../utils/parseAction";
import BotService from "../../../service/telegram/BotService";
import { Language } from "../../../translations";
import UserManagement from "../../../service/user/UserManagement";
import { filterCompleteSpotOrdersIK, filterSpotOrdersIK, RM_Trade, spotOrderMenu } from "../../../keyboards";
import CustomOrder from "../../../models/spotTrade/modelOrder";
import paginateCoinList from "../../../utils/pagination/paginateCoinList";
import { generatePaginatedKeyboard } from "../../../keyboards/generators/generatePaginatedKeyboard";
import { UserContext } from "../../../context/userContext";
import trimNumber from "../../../utils/trimNumber";
import { bot } from "../../../bot";
import BalanceService from "../../../service/balance/BalanceService";
import { SpotTradeFeeCalculator } from "../../../utils/calculators/spotTradeFeeCalculator";
import { generateOrderNumberSpotTrade } from "../../../service/trade/SpotTradeService";
import RateAggregator from '../../../service/rate/RateAggregator'


async function handleSpotTrade(msg: Message) {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'completedSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Выберите раздел: ', { replyMarkup: filterCompleteSpotOrdersIK });
        break;
      }

      case 'allCompletedSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const userOrders = await CustomOrder.find({
          id: userId,
          status: { $nin: ['Selling'] }
        });

        if (userOrders.length === 0) {
          return BotService.sendMessage(userId, 'У вас не сработал еще ни один ордер 😞');
        }

        const orderMessages = userOrders.map(order => {
          return `Ордер №${order.orderNumber},
Статус: ${order.status},
Продажа монеты: ${order.sellCoin.toUpperCase()},
Покупка монеты: ${order.buyCoin.toUpperCase()},
Сумма покупки: ${order.buyAmount} ${order.buyCoin.toUpperCase()},
Сумма продажи: ${order.sellAmount} ${order.sellCoin.toUpperCase()},
Курс осуществления операции: 1 ${order.sellCoin.toUpperCase()} = ${order.rate} ${order.buyCoin.toUpperCase()}.\n\n`;
        });

        const chunkSize = 10; // Скільки ордерів показати за одне повідомлення
        for (let i = 0; i < orderMessages.length; i += chunkSize) {
          const chunk = orderMessages.slice(i, i + chunkSize).join('\n');
          await BotService.sendMessage(userId, chunk);
        }
        break;
      }

      case 'filtredCompletedSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const pageCoins = await paginateCoinList(1)
        await BotService.sendMessage(
          userId,
          `🪙 Выберите монету для продажи, чтобы увидеть доступные ордера:`,
          { replyMarkup: generatePaginatedKeyboard(pageCoins, 'spotOrdersCompletedFilterSellCoin', 1) }
        );
        break;
      }

      case 'spotOrdersCompletedFilterSellCoin': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          return await BotService.sendMessage(
            userId,
            `🪙 Выберите монету для продажи, чтобы увидеть доступные ордера:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotOrdersCompletedFilterSellCoin', page) }
          );
        }

        const sellCoin = params[0];
        UserContext.set(userId, 'sellCoinSpotTrade', sellCoin);

        const coinArray = await paginateCoinList(1);
        const index = coinArray.indexOf(sellCoin);

        if (index !== -1) {
          coinArray.splice(index, 1);
        }

        BotService.sendMessage(
          userId,
          `🪙 Выберите монету для покупки, чтобы увидеть доступные ордера:`,
          { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotOrdersCompletedFilterBuyCoin', 1) }
        );
        break;
      }

      case 'spotOrdersCompletedFilterBuyCoin': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const sellCoin = UserContext.get(userId, 'sellCoinSpotTrade')

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          const index = coinArray.indexOf(sellCoin);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          return await BotService.sendMessage(
            userId,
            `💱 Выберите монету для покупки, чтобы увидеть доступные ордера:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotOrdersCompletedFilterBuyCoin', page) }
          );
        }

        const buyCoin = params[0];
        const userOrders = await CustomOrder.find({
          id: userId,
          sellCoin,
          buyCoin,
          status: { $ne: 'Selling' }
        });

        if (!userOrders.length) {
          return BotService.sendMessage(userId, 'У вас не сработал еще ни один ордер 😞');
        }

        const messageUserOrder = userOrders.map(order => {
          const sellCoin = (order.sellCoin || '').toUpperCase();
          const buyCoin = (order.buyCoin || '').toUpperCase();
          return `Ордер №${order.orderNumber}
Статус: ${order.status}
Продажа монеты: ${sellCoin}
Покупка монеты: ${buyCoin}
Сумма покупки: ${order.buyAmount} ${buyCoin}
Сумма продажи: ${order.sellAmount} ${sellCoin}
Курс: 1 ${sellCoin} = ${order.rate} ${buyCoin}\n`;
        }).join('\n');

        BotService.sendMessage(userId, messageUserOrder);
        break;
      }

      case 'listSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Выберите раздел: ', { replyMarkup: filterSpotOrdersIK });
        break;
      }

      case 'allSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const ordersArray = await CustomOrder.find({
          status: { $nin: ['Done', 'Deleted'] }
        });

        if (ordersArray.length === 0) {
          return BotService.sendMessage(userId, 'Сейчас на площадке нету ни 1 ордера.')
        }

        for (const order of ordersArray) {
          const sellCoin = (order.sellCoin || '').toUpperCase();
          const buyCoin = (order.buyCoin || '').toUpperCase();
          const orderNumber = order.orderNumber;

          const message = `Ордер №${orderNumber}
Статус: ${order.status}
Продажа монеты: ${sellCoin}
Покупка монеты: ${buyCoin}
Сумма покупки: ${trimNumber(order.buyAmount)} ${buyCoin}
Сумма продажи: ${trimNumber(order.sellAmount)} ${sellCoin}
Курс: 1 ${sellCoin} = ${trimNumber(order.rate)} ${buyCoin}.\n`;

          const replyMarkup = bot.inlineKeyboard([
            [bot.inlineButton('Создать встречный ордер ✅', { callback: `createCounterOrder_${orderNumber}` })]
          ]);

          bot.sendMessage(userId, message, { replyMarkup });
        }
        break;
      }

      case 'createCounterOrder': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const orderNumber = params[0];

        const selectOrderData = await CustomOrder.findOne({ orderNumber });

        if (['Done', 'Deleted'].includes(selectOrderData.status)) {
          return BotService.sendMessage(userId, 'Данного ордера больше не существует!');
        }

        const userBalance = await BalanceService.getBalance(userId, selectOrderData.buyCoin) || 0;
        const sellCoinSymbol = (selectOrderData.buyCoin || '').toUpperCase();
        const rateCounterOrder = 1 / selectOrderData.rate;

        UserContext.set(userId, 'rate', rateCounterOrder);
        UserContext.set(userId, 'buyCoinSpotTrade', selectOrderData.sellCoin);
        UserContext.set(userId, 'sellCoinSpotTrade', selectOrderData.buyCoin);
        UserContext.set(userId, 'maxOrderAmountSpotTrade', selectOrderData.buyAmount);

        const textMessage = `Выбран ордер №${orderNumber}!
Для продажи доступно: ${trimNumber(userBalance)} ${sellCoinSymbol}.
Комиссия сделки оплачивается в монете ${SpotTradeFeeCalculator.commissionCoin.toUpperCase()}.
Введите сумму продажи ${selectOrderData.buyCoin} (не больше: <code>${selectOrderData.buyAmount}</code> ${selectOrderData.buyCoin}):`;

        BotService.sendMessage(userId, textMessage, { parseMode: 'html' });
        UserManagement.setState(userId, 70)
        break;
      }

      case 'createSpotOrder': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          return BotService.sendMessage(userId, 'Создание ордера отменено. Выьерите раздел:', { replyMarkup: spotOrderMenu(lang) })
        }

        const spotTradeOrderNumber = await generateOrderNumberSpotTrade();
        const { sellCoinSpotTrade, buyCoinSpotTrade, tradeAmountSpotTrade, rate, buyAmountSpotTrade, commissionSpotTrade } = UserContext.getMany(userId, [
          'sellCoinSpotTrade',
          'buyCoinSpotTrade',
          'tradeAmountSpotTrade',
          'rate',
          'buyAmountSpotTrade',
          'commissionSpotTrade'
        ]);


        await CustomOrder.create({
          id: userId,
          orderNumber: spotTradeOrderNumber,
          status: 'Selling',
          sellCoin: sellCoinSpotTrade,
          buyCoin: buyCoinSpotTrade,
          sellAmount: tradeAmountSpotTrade,
          buyAmount: buyAmountSpotTrade,
          rate: rate,
          comission: commissionSpotTrade
        });

        await Promise.all([
          BalanceService.freeze(userId, tradeAmountSpotTrade, sellCoinSpotTrade),
          BalanceService.freeze(userId, commissionSpotTrade, SpotTradeFeeCalculator.commissionCoin.toUpperCase()),
          BotService.sendMessage(userId, `Ордер №${spotTradeOrderNumber} успешно создан ✅`, { replyMarkup: RM_Trade(lang) }),
          BotService.sendLog(`Пользователь ${userId} создал ордер спотовой торговли №${spotTradeOrderNumber}`)
        ]);
        break;
      }

      case 'filtredSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const pageCoins = await paginateCoinList(1)
        await BotService.sendMessage(
          userId,
          `🪙 Выберите монету для продажи, чтобы увидеть доступные ордера:`,
          { replyMarkup: generatePaginatedKeyboard(pageCoins, 'spotOrdersFilterSellCoin', 1) }
        );
        break;
      }

      case 'spotOrdersFilterSellCoin': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          return await BotService.sendMessage(
            userId,
            `🪙 Выберите монету для продажи, чтобы увидеть доступные ордера:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotOrdersFilterSellCoin', page) }
          );
        }

        const sellCoin = params[0];
        UserContext.set(userId, 'sellCoinSpotTrade', sellCoin);

        const coinArray = await paginateCoinList(1);
        const index = coinArray.indexOf(sellCoin);

        if (index !== -1) {
          coinArray.splice(index, 1);
        }

        BotService.sendMessage(
          userId,
          `🪙 Выберите монету для покупки, чтобы увидеть доступные ордера:`,
          { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotOrdersFilterBuyCoin', 1) }
        );
        break;
      }

      case 'spotOrdersFilterBuyCoin': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const sellCoin = UserContext.get(userId, 'sellCoinSpotTrade')

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          const index = coinArray.indexOf(sellCoin);

          if (index !== -1) {
            coinArray.splice(index, 1);
          }

          return await BotService.sendMessage(
            userId,
            `💱 Выберите монету для покупки, чтобы увидеть доступные ордера:`,
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotOrdersFilterBuyCoin', page) }
          );
        }

        const buyCoin = params[0];

        const userOrders = await CustomOrder.find({
          sellCoin,
          buyCoin,
          status: { $nin: ['Done', 'Deleted'] }
        });

        if (!userOrders.length) {
          return BotService.sendMessage(userId, 'По данному запросу ничего не найдено 😞');
        }

        for (const order of userOrders) {
          const sellCoinSymbol = (order.sellCoin || '').toUpperCase();
          const buyCoinSymbol = (order.buyCoin || '').toUpperCase();

          const message = `Ордер №${order.orderNumber}
Статус: ${order.status}
Продажа монеты: ${sellCoinSymbol}
Покупка монеты: ${buyCoinSymbol}
Сумма покупки: ${trimNumber(order.buyAmount)} ${buyCoinSymbol}
Сумма продажи: ${trimNumber(order.sellAmount)} ${sellCoinSymbol}
Курс: 1 ${sellCoinSymbol} = ${trimNumber(order.rate)} ${buyCoinSymbol}.\n`;

          const replyMarkup = bot.inlineKeyboard([
            [bot.inlineButton('Создать встречный ордер ✅', { callback: `createCounterOrder_${order.orderNumber}` })]
          ]);

          await bot.sendMessage(userId, message, { replyMarkup });
        }
        break;
      }

      case 'createdSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const activeUserOrders = await CustomOrder.find({
          id: userId,
          status: { $nin: ['Done', 'Deleted'] }
        });

        if (!activeUserOrders.length) {
          return BotService.sendMessage(userId, 'По данному запросу ничего не найдено 😞');
        }

        for (const order of activeUserOrders) {
          const sellCoinSymbol = (order.sellCoin || '').toUpperCase();
          const buyCoinSymbol = (order.buyCoin || '').toUpperCase();

          const message = `Ордер №${order.orderNumber}
Статус: ${order.status}
Продажа монеты: ${sellCoinSymbol}
Покупка монеты: ${buyCoinSymbol}
Сумма покупки: ${trimNumber(order.buyAmount)} ${buyCoinSymbol}
Сумма продажи: ${trimNumber(order.sellAmount)} ${sellCoinSymbol}
Курс: 1 ${sellCoinSymbol} = ${trimNumber(order.rate)} ${buyCoinSymbol}.`;

          const settingsOrderIK = bot.inlineKeyboard([
            [bot.inlineButton('Удалить ❌', { callback: `deleteOrderSpotTrade_${order.orderNumber}` })]
          ]);

          await bot.sendMessage(userId, message, { replyMarkup: settingsOrderIK });
        }
        break;
      }

      case 'deleteOrderSpotTrade': {
        const numberDeleteOrder = params[0];
        const deleteOrder = await CustomOrder.findOne({ id: userId, orderNumber: numberDeleteOrder });

        if (!deleteOrder || ['Deleted', 'Done'].includes(deleteOrder.status)) {
          return BotService.sendMessage(userId, `Простите, но ордера по №${numberDeleteOrder} не существует.`);
        }

        await CustomOrder.updateOne(
          { id: userId, orderNumber: numberDeleteOrder },
          { $set: { status: 'Deleted' } }
        );

        await Promise.all([
          BalanceService.unfreeze(userId, deleteOrder.sellAmount, deleteOrder.sellCoin),
          BalanceService.unfreeze(userId, deleteOrder.comission, SpotTradeFeeCalculator.commissionCoin.toUpperCase())
        ]);

        await BotService.sendMessage(userId, `Ордер №${numberDeleteOrder} был успешно удалён ✅`);
        break;
      }

      case 'createNewSpotOrders': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'typeSpotTradeOrder', 'sell');

        const page1 = await paginateCoinList(1);
        BotService.sendMessage(
          userId,
          'Выберите монету которую хотите продать:',
          { replyMarkup: generatePaginatedKeyboard(page1, 'spotTradeNewOrderSelectSellCoin', 1) }
        );
        break;
      }

      case 'spotTradeNewOrderSelectSellCoin': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          BotService.sendMessage(
            userId,
            'Выберите монету которую хотите продать:',
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotTradeNewOrderSelectSellCoin', page) }
          );

          return
        }

        const sellCoin = params[0];
        const coinArray = await paginateCoinList(1);
        const index = coinArray.indexOf(sellCoin);

        UserContext.set(userId, 'sellCoinSpotTrade', sellCoin);

        if (index !== -1) {
          coinArray.splice(index, 1);
        }

        BotService.sendMessage(
          userId,
          'Выберите монету которую хотите купить:',
          { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotTradeNewOrderSelectBuyCoin', 1) }
        );
        break;
      }

      case 'spotTradeNewOrderSelectBuyCoin': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          BotService.sendMessage(
            userId,
            'Выберите монету которую хотите продать:',
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'spotTradeNewOrderSelectBuyCoin', page) }
          );
          return
        }

        const sellCoin = UserContext.get(userId, 'sellCoinSpotTrade');
        const buyCoin = params[0];

        const rate = await RateAggregator.getCoinRate(sellCoin, buyCoin);

        UserContext.setMany(userId, {
          rate: trimNumber(rate),
          buyCoinSpotTrade: buyCoin
        });

        const sellCoinSymbol = sellCoin.toUpperCase();
        const buyCoinSymbol = buyCoin.toUpperCase();
        const commissionCoinSymbol = SpotTradeFeeCalculator.commissionCoin.toUpperCase();

        const message = `📈 <b>Курс:</b> 1 ${sellCoinSymbol} ≈ <code>${trimNumber(rate)}</code> ${buyCoinSymbol}.
💸 <b>Комиссия сделки:</b> оплачивается в монете ${commissionCoinSymbol}.

👉 Введите <b>курс</b>, по которому будет осуществлена торговля (пример: <i>0.0001</i>):`;

        UserManagement.setState(userId, 71)
        await bot.sendMessage(userId, message, { parseMode: 'html' });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler spot trade`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handleSpotTrade