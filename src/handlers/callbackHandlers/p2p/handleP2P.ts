import { Message } from "telebot";
import BotService from "../../../service/telegram/BotService";
import UserManagement from "../../../service/user/UserManagement";
import getTranslation, { Language } from "../../../translations";
import { parseAction } from "../../../utils/parseAction";
import { filterBuyP2PIK, filterSellP2PIK, payOrder, RM_Home, tradeP2PMenuIK, typeP2POrder } from "../../../keyboards";
import CustomP2POrder from "../../../models/p2p/modelP2POrder";
import { bot } from "../../../bot";
import { UserContext } from "../../../context/userContext";
import paginateCoinList from "../../../utils/pagination/paginateCoinList";
import { generateButton } from "../../../keyboards/generators/generateButton";
import { P2P_CURRENCY, PAYMENT_SYSTEM_RUB, PAYMENT_SYSTEM_TUR, PAYMENT_SYSTEM_UAH, payOrderCoin } from "../../../utils/constans";
import { getP2POrderPreviewText } from "../../../utils/formatters/OrderUtils";
import AuthCodeService from "../../../service/mail/AuthCodeService";
import { generatePaginatedKeyboard } from "../../../keyboards/generators/generatePaginatedKeyboard";
import BalanceService from "../../../service/balance/BalanceService";
import OrderFilling from "../../../models/spotTrade/modelOrderFilling";

async function handleP2P(msg: Message) {
  const data = msg.data;
  const userId = msg.from.id;
  const messageId = msg.message.message_id;

  try {
    const { user } = await UserManagement.getInfoUser(userId);
    const lang = user.lang as Language;

    const { action, params } = parseAction(data);

    switch (action) {
      case 'tradeP2P':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, getTranslation(lang, 'p2pChapterText'), { replyMarkup: tradeP2PMenuIK(lang) });
        break;

      case 'dealP2P':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, getTranslation(lang, 'p2pDealText'));
        break;

      case 'createdP2POrders':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const activeOrders = await CustomP2POrder.find({
          id: userId,
          status: { $nin: ['Done', 'Deleted'] }
        });

        if (activeOrders.length === 0) {
          return BotService.sendMessage(userId, 'Сейчас на площадке не торгуется ни 1 ордер 😞');
        }

        for (const order of activeOrders) {
          const {
            orderNumber,
            type,
            status,
            coin,
            amount,
            minAmount,
            currency,
            paymentSystem,
            rate,
            requisites
          } = order;

          const coinUpper = coin.toUpperCase();
          const currencyUpper = currency.toUpperCase();

          const action = type === 'buy' ? 'Покупка' : 'Продажа';
          const minAmountText = `Минимальная сумма ${action.toLowerCase()} монеты: ${minAmount} ${coinUpper}`;
          const requisitesText = type === 'sell' ? `Реквизиты: ${requisites}\n` : '';

          const message = `Ордер №${orderNumber},
Тип ордера: ${type},
Статус: ${status},
${action} монеты: ${coinUpper},
Количество ${action.toLowerCase()}: ${amount} ${coinUpper},
${minAmountText},
Валюта совершения сделки: ${currency},
Способ оплаты: ${paymentSystem},
${requisitesText}Курс ${type === 'buy' ? 'покупки' : 'продажи'}: ${rate} ${currencyUpper}.`;

          const keyboard = bot.inlineKeyboard([
            [bot.inlineButton('Удалить ордер ❌', { callback: `deleteOrderP2P_${orderNumber}` })]
          ]);

          await bot.sendMessage(userId, message, { replyMarkup: keyboard });
        }
        break;

      case 'newP2POrder':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Выберите тип ордера:', { replyMarkup: typeP2POrder });
        break;

      case 'p2pBuy':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        UserContext.set(userId, 'typeOrderP2P', 'buy');
        const page1 = await paginateCoinList(1);

        BotService.sendMessage(userId, 'Выберите монету которую хотите купить:', {
          replyMarkup: generatePaginatedKeyboard(page1, 'p2pSelectBuyCoin', 1)
        });
        break;

      case 'p2pSelectBuyCoin':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          return BotService.sendMessage(userId, 'Выберите монету которую хотите купить:', {
            replyMarkup: generatePaginatedKeyboard(coinArray, 'p2pSelectBuyCoin', page)
          });
        }

        UserContext.set(userId, 'coinP2P', params[0]);

        await BotService.sendMessage(userId, 'Выбирете валюту совершения сделки:', {
          replyMarkup: generateButton(P2P_CURRENCY, 'selectCurrencyP2P')
        });
        break;

      case 'selectCurrencyP2P':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'currencyP2P', params[0]);

        const paymentOptionsMap = {
          UAH: PAYMENT_SYSTEM_UAH,
          RUB: PAYMENT_SYSTEM_RUB,
          TRY: PAYMENT_SYSTEM_TUR
        };

        const paymentOptions = paymentOptionsMap[params[0]];
        await BotService.sendMessage(userId, 'Выберите способ оплаты:', {
          replyMarkup: generateButton(paymentOptions, 'selectPaymentSystemP2P')
        });
        break;

      case 'selectPaymentSystemP2P':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        UserContext.set(userId, 'paymentSystemP2P', params[0]);

        const typeOrder = UserContext.get(userId, 'typeOrderP2P');

        if (typeOrder === 'buy') {
          UserManagement.setState(userId, 61);
          await bot.sendMessage(userId, 'Введите количество покупки монеты:');
        } else {
          UserManagement.setState(userId, 60);
          await bot.sendMessage(userId, 'Введите реквизиты на которые желаете получить деньги:');
        }
        break;

      case 'createOrderP2P':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'cancel') {
          return BotService.sendMessage(userId, 'Вы отменили создание ордера! Выберите действие:', { replyMarkup: tradeP2PMenuIK(lang) });
        }

        const {
          typeOrderP2P,
          orderNumber,
          userRateP2P,
          coinP2P,
          currencyP2P,
          amountP2P,
          minSellAmountP2P,
          paymentSystemP2P,
        } = UserContext.getMany(userId, [
          'typeOrderP2P',
          'orderNumber',
          'userRateP2P',
          'coinP2P',
          'currencyP2P',
          'amountP2P',
          'minSellAmountP2P',
          'paymentSystemP2P',
        ]);

        if (typeOrderP2P === 'sell') {
          const sendCodeUser = await AuthCodeService.sendEmailVerifyCode(user.mail);
          if (sendCodeUser.status) {
            UserManagement.setState(userId, 64);
            await bot.sendMessage(userId, getTranslation(lang, 'confirmationPromptText'));
          } else {
            await bot.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
          }
        } else {
          await CustomP2POrder.create({
            id: userId,
            orderNumber,
            typeOrder: typeOrderP2P,
            type: typeOrderP2P,
            status: 'Selling',
            coin: coinP2P,
            currency: currencyP2P,
            amount: amountP2P,
            rate: userRateP2P,
            minAmount: minSellAmountP2P,
            paymentSystem: paymentSystemP2P,
            requisites: 0
          });

          const previewText = getP2POrderPreviewText('buy', lang, {
            orderNumber,
            coin: coinP2P,
            amount: amountP2P,
            minimalAmountSell: minSellAmountP2P,
            currency: currencyP2P,
            paymentSystem: paymentSystemP2P,
            rate: userRateP2P
          });

          await BotService.sendMessage(userId, 'Ордер успешно создан ✅', {
            replyMarkup: RM_Home(lang)
          });

          await BotService.sendLog(`Пользователь ${userId} создал P2P ордер на покупку №${orderNumber}.\n\n${previewText}`);
        }
        break;

      case 'p2pSell':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (!user.mail) {
          return BotService.sendMessage(userId, getTranslation(lang, 'emailRequiredMessage'))
        }

        UserContext.set(userId, 'typeOrderP2P', 'sell');
        const firstPage = await paginateCoinList(1);

        BotService.sendMessage(userId, 'Выберите монету которую хотите продать:', {
          replyMarkup: generatePaginatedKeyboard(firstPage, 'p2pSelectSellCoin', 1)
        });
        break;

      case 'p2pSelectSellCoin':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);

          return BotService.sendMessage(userId, 'Выберите монету которую хотите продать:', {
            replyMarkup: generatePaginatedKeyboard(coinArray, 'p2pSelectSellCoin', page)
          });
        }

        UserContext.set(userId, 'coinP2P', params[0]);

        await BotService.sendMessage(userId, 'Выбирете валюту совершения сделки:', {
          replyMarkup: generateButton(P2P_CURRENCY, 'selectCurrencyP2P')
        });
        break;

      case 'deleteOrderP2P':
        const numberDeleteOrder = +params[0];

        const order = await CustomP2POrder.findOne({ id: userId, orderNumber: numberDeleteOrder });

        if (!order || ['Deleted', 'Done', 'Filling'].includes(order.status)) {
          return BotService.sendMessage(userId, `Простите, но ордера по №${numberDeleteOrder} не существует.`);
        }

        await CustomP2POrder.updateOne(
          { id: userId, orderNumber: numberDeleteOrder },
          { $set: { status: 'Deleted' } }
        );

        if (order.type !== 'buy') {
          await BalanceService.unfreeze(userId, order.amount, order.coin);
          await BotService.sendMessage(userId, `Ордер №${numberDeleteOrder} был успешно удалён, средства возвращены на ваш баланс.`);
        } else {
          await BotService.sendMessage(userId, `Ордер №${numberDeleteOrder} был успешно удалён.`);
        }
        break;

      case 'p2pBack':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Вы перешли в раздел Р2Р:', { replyMarkup: tradeP2PMenuIK(lang) });
        break;

      case 'showBuyP2POrders':
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        BotService.sendMessage(userId, 'Выберите раздел: ', { replyMarkup: filterBuyP2PIK });
        break;

      case 'p2pTrade': {
        const orderNumber = params[0];

        const order = await CustomP2POrder.findOne({ orderNumber });

        if (!order || order.status !== 'Selling') {
          return bot.sendMessage(userId, `Простите, но ордер №${orderNumber} больше не доступен.`);
        }

        UserContext.set(userId, 'selectedOrderP2P', order);

        if (order.type === 'buy') {
          UserManagement.setState(userId, 65);
          bot.sendMessage(
            userId,
            `Выбран ордер №${orderNumber}. Введите реквизиты, на которые желаете получить деньги:`
          );
        } else {
          UserManagement.setState(userId, 68);
          const { id: sellerId, minAmount, amount, coin } = order;

          await Promise.all([
            bot.sendMessage(
              sellerId,
              `Сработал ордер №${orderNumber}, покупатель в скором времени совершит оплату.`
            ),
            bot.sendMessage(
              userId,
              `Выбран ордер №${orderNumber}. Лимит ордера: ${minAmount} - ${amount} ${coin.toUpperCase()}.\nВведите количество покупки монеты:`
            )
          ]);
        }
        break;
      }

      case 'p2pSellOrderConfirm': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const selectedOrder = UserContext.get(userId, 'selectedOrderP2P');

        if (params[0] === 'cancel') {
          await Promise.all([
            OrderFilling.deleteOne({ orderNumber: selectedOrder.orderNumber }),
            CustomP2POrder.updateOne(
              { orderNumber: selectedOrder.orderNumber },
              { $set: { status: 'Selling' } }
            )
          ]);

          BotService.sendMessage(userId, 'Торговля отменена!', { replyMarkup: RM_Home(lang) })
        }

        const sendCode = await AuthCodeService.sendEmailVerifyCode(user.mail);

        if (sendCode.status) {
          UserManagement.setState(userId, 67);
          BotService.sendMessage(userId, getTranslation(lang, 'confirmationPromptText'))
        } else {
          BotService.sendMessage(userId, getTranslation(lang, 'unexpectedError'));
        }
        break;
      }

      case 'p2pSellerConfirm': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        const orderNumber = params[0];
        const order = await OrderFilling.findOne({ orderNumber });
        if (!order) {
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        if (params[1] === 'Cancel') {
          await Promise.all([
            OrderFilling.deleteOne({ orderNumber: order.orderNumber }),
            CustomP2POrder.updateOne(
              { orderNumber: order.orderNumber },
              { $set: { status: 'Selling' } }
            )
          ]);

          await Promise.all([
            BotService.sendMessage(order.creatorOrder, 'Вы отменили ордер!', { replyMarkup: RM_Home(lang) }),
            BotService.sendMessage(order.client, `Покупатель отменил ордер!`, { replyMarkup: RM_Home(lang) })
          ])
        }

        await OrderFilling.updateOne(
          { orderNumber },
          { $set: { status: 'Accept' } }
        );

        await Promise.all([
          BotService.sendMessage(
            order.creatorOrder,
            'Вы оплатили ордер, ожидайте перевод монет на аккаунт другой стороной.'
          ),
          BotService.sendMessage(
            order.client,
            `Покупатель оплатил ордер! Переведите монеты на его счет.`,
            {
              replyMarkup: generateButton(payOrderCoin, `sellerSendCoin_${order.orderNumber}`)
            }
          )
        ])
        break;
      }

      case 'sellerSendCoin': {
        const orderNumber = params[0];
        const [orderData, platformOrderData] = await Promise.all([
          OrderFilling.findOne({ orderNumber }),
          CustomP2POrder.findOne({ orderNumber })
        ]);

        if (!orderData || !platformOrderData) {
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        const isBuyOrder = platformOrderData.type === 'buy';
        const buyerId = isBuyOrder ? orderData.creatorOrder : orderData.client;
        const sellerId = isBuyOrder ? orderData.client : orderData.creatorOrder;

        await Promise.all([
          BalanceService.updateBalance(buyerId, orderData.coin, orderData.coinAmount),
          BalanceService.updateHoldBalance(sellerId, orderData.coin, -orderData.coinAmount)
        ]);

        if (orderData.coinAmount === platformOrderData.amount) {
          await CustomP2POrder.updateOne(
            { orderNumber },
            { $set: { status: 'Done' } }
          );
        } else if (orderData.coinAmount < platformOrderData.amount) {
          const newAmount = platformOrderData.amount - orderData.coinAmount;
          const updates: any = {
            status: 'Selling',
            amount: newAmount
          };
          if (platformOrderData.minAmount > newAmount) {
            updates.minAmount = newAmount;
          }
          await CustomP2POrder.updateOne(
            { orderNumber },
            { $set: updates }
          );
        }

        await OrderFilling.deleteOne({ orderNumber });

        const successMsg = `Ордер выполнен успешно, ${orderData.coinAmount} ${orderData.coin} будут зачислены на ваш аккаунт ✅`;

        if (isBuyOrder) {
          await Promise.all([
            BotService.sendMessage(orderData.creatorOrder, successMsg),
            BotService.deleteMessage(orderData.client, messageId),
            BotService.sendMessage(orderData.client, 'Ордер выполнен успешно ✅')
          ]);
          await BotService.sendLog(`Пользователь ${orderData.creatorOrder} успешно купил у пользователя ${orderData.client} ${orderData.coinAmount} ${orderData.coin}`);
        } else {
          await Promise.all([
            BotService.sendMessage(orderData.client, successMsg),
            BotService.deleteMessage(orderData.creatorOrder, messageId),
            BotService.sendMessage(orderData.creatorOrder, 'Ордер выполнен успешно ✅')
          ]);
          await BotService.sendLog(`Пользователь ${orderData.client} успешно купил у пользователя ${orderData.creatorOrder} ${orderData.coinAmount} ${orderData.coin}`);
        }
        break;
      }

      case 'p2pBuyOrderConfirm': {
        BotService.deleteMessage(userId, messageId);
        const selectedOrder = UserContext.get(userId, 'selectedOrderP2P');
        const amount = UserContext.get(userId, 'amountP2P');

        if (params[0] === 'cancel') {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder.orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder.orderNumber },
            { $set: { status: 'Selling' } }
          );
          bot.sendMessage(userId, 'Операция отменена!');
        }

        const transferAmount = selectedOrder.rate * amount;

        UserContext.set(userId, 'transferAmountP2P', transferAmount);

        await OrderFilling.updateOne(
          { orderNumber: selectedOrder.orderNumber },
          { $set: { status: "Approve" } }
        );
        await bot.sendMessage(userId, `Переведите ${transferAmount} ${selectedOrder.currency} на банковский счет <code><i>${selectedOrder.requisites}</i></code>. После оплаты нажмите кнопку готово.`, { replyMarkup: payOrder, parseMode: 'html' });
        break;
      }

      case 'payOrder': {
        BotService.deleteMessage(userId, messageId);
        const selectedOrder = UserContext.get(userId, 'selectedOrderP2P');

        if (params[0] === 'cancel') {
          await Promise.all([
            OrderFilling.deleteOne({ orderNumber: selectedOrder.orderNumber }),
            CustomP2POrder.updateOne(
              { orderNumber: selectedOrder.orderNumber },
              { $set: { status: 'Selling' } }
            ),
            BotService.sendMessage(userId, 'Операция отменена!')
          ]);
          return;
        }

        await OrderFilling.updateOne(
          { orderNumber: selectedOrder.orderNumber },
          { $set: { status: 'Accept' } }
        );

        const orderData = await OrderFilling.findOne({ orderNumber: selectedOrder.orderNumber });
        if (!orderData) {
          return BotService.sendMessage(userId, 'Ошибка: ордер не найден.');
        }

        await Promise.all([
          BotService.sendMessage(
            userId,
            'Вы оплатили ордер, ожидайте перевод монет на аккаунт другой стороной'
          ),
          BotService.sendMessage(
            selectedOrder.id,
            `Покупатель оплатил ордер!\nСумма покупки: ${orderData.coinAmount} ${orderData.coin} = ${orderData.currencyAmount} ${orderData.currency}.\nПереведите монеты на его счет.`,
            { replyMarkup: generateButton(payOrderCoin, `sellerSendCoin_${selectedOrder.orderNumber}`) }
          )
        ]);
        break;
      }

      case 'showSellP2POrders': {
        BotService.deleteMessage(userId, messageId);
        if (!user.mail) {
          return BotService.sendMessage(userId, getTranslation(lang, 'emailRequiredMessage'))
        }
        BotService.sendMessage(userId, 'Выберите раздел: ', { replyMarkup: filterSellP2PIK })
        break;
      }

      case 'filterOrdersP2P': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const side = params[0];

        UserContext.set(userId, 'p2pSide', side);

        const pageCoins = await paginateCoinList(1);
        await BotService.sendMessage(
          userId,
          `🪙 Пожалуйста, выберите монету для фильтрации доступных ордеров на ${side === 'buy' ? 'покупку' : 'продажу'}:`,
          { replyMarkup: generatePaginatedKeyboard(pageCoins, 'coinFilterP2P', 1) }
        );
        break;
      }

      case 'coinFilterP2P': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        if (params[0] === 'Page') {
          const page = +params[1];
          const coinArray = await paginateCoinList(page);
          return BotService.sendMessage(
            userId,
            '🪙 Пожалуйста, выберите монету для фильтрации:',
            { replyMarkup: generatePaginatedKeyboard(coinArray, 'coinFilterP2P', page) }
          );
        }

        UserContext.set(userId, 'coinP2P', params[0]);
        await BotService.sendMessage(
          userId,
          `💵 Пожалуйста, выберите валюту для фильтрации доступных ордеров:`,
          { replyMarkup: generateButton(P2P_CURRENCY, 'currencyFilterP2P') }
        );
        break;
      }

      case 'currencyFilterP2P': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));

        const coin = UserContext.get(userId, 'coinP2P');
        const side = UserContext.get(userId, 'p2pSide');
        const type = side === 'buy' ? 'sell' : 'buy';

        UserContext.set(userId, 'currencyP2P', params[0]);

        const orders = await CustomP2POrder.find({
          type,
          coin,
          currency: params[0],
          status: { $nin: ['Done', 'Filling', 'Deleted'] }
        });

        if (!orders.length) {
          return bot.sendMessage(userId, '😞 На данный момент нет доступных ордеров по выбранным параметрам.');
        }

        for (const order of orders) {
          const {
            orderNumber,
            id: sellerId,
            coin: orderCoin,
            amount,
            minAmount,
            currency,
            paymentSystem,
            rate
          } = order;

          const isUserOwner = +sellerId === userId;
          const message = `Ордер №${orderNumber}${isUserOwner ? ' (вы)' : ''},
Покупка монеты: ${orderCoin},
Количество: ${amount} ${orderCoin},
Минимальная сумма закупки: ${minAmount} ${orderCoin},
Валюта: ${currency},
Способ оплаты: ${paymentSystem},
Курс: ${rate} ${currency.toUpperCase()}.`;

          if (isUserOwner) {
            await bot.sendMessage(userId, message);
          } else {
            const keyboard = bot.inlineKeyboard([
              [bot.inlineButton(
                side === 'buy' ? 'Купить' : 'Продать',
                { callback: `p2pTrade_${orderNumber}` }
              )]
            ]);
            await bot.sendMessage(userId, message, { replyMarkup: keyboard });
          }
        }
        break;
      }

      case 'showAllOrdersP2P': {
        BotService.deleteMessage(userId, messageId).catch((e) => console.log(e));
        const side = params[0];
        const type = side === 'buy' ? 'sell' : 'buy';

        const orders = await CustomP2POrder.find({
          type,
          status: { $nin: ['Done', 'Filling', 'Deleted'] }
        });

        if (!orders.length) {
          return bot.sendMessage(userId, '😞 На данный момент нет доступных ордеров по выбранным параметрам.');
        }

        for (const order of orders) {
          const isUserOrder = +order.id === userId;
          const keyboard = isUserOrder ? undefined : bot.inlineKeyboard([
            [bot.inlineButton('Купить', { callback: `p2pTrade_${order.orderNumber}` })]
          ]);

          const message = `Ордер №${order.orderNumber}${isUserOrder ? ' (you)' : ''},
Покупка монеты: ${order.coin},
Количество покупки: ${order.amount} ${order.coin},
Минимальная сумма закупки монеты: ${order.minAmount} ${order.coin},
Валюта совершения сделки: ${order.currency},
Способ оплаты: ${order.paymentSystem},
Курс покупки: ${order.rate} ${order.currency.toUpperCase()}.`;

          await bot.sendMessage(userId, message, { replyMarkup: keyboard });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`error handler p2p`, error);
    BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
  }
}

export default handleP2P;