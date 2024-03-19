const TeleBot = require('telebot');
const mongoose = require('mongoose');
const config = require('./config.js');
const validator = require('validator');
const WalletUserModel = require('./model/modelWallet.js');


const {
  RM_Home,
  payOrder,
  currency,
  p2pMenuIK,
  cabinetIK,
  exchangeIK,
  adminPanelIK,
  payOrderCoin,
  typeP2POrder,
  buyerPayOrder,
  spotOrderMenu,
  balancePage2IK,
  balancePage3IK,
  balancePage4IK,
  paymentSystemUA,
  paymentSystemRU,
  paymentSystemTUR,
  liquidityPoolsIK,
  balanceStartPageIK,
  acceptCancelOrderIK,
  acceptCancelExchangeIK,
  acceptCancelWithdrawalIK,
  stackingIK,
} = require('./keyboard.js');

const {
  SendCoin,
  TransferCommission,
} = require('./function/decimal.js');

const {
  decimalMnemonics,
  decimalWallet
} = require('./decimalConfig.js');

const AuthenticationService = require('./service/auth.js');
const BalanceUserModel = require('./model/modelBalance.js');
const UserManagement = require('./service/userManagement.js');
const CustomOrder = require('./model/modelOrder.js');
const CustomP2POrder = require('./model/modelP2POrder.js');
const UserModel = require('./model/modelUser.js');
const ExchangeRateCoin = require('./exchanger/exchangeRate.js');
const ExchangeCoinTransaction = require('./exchanger/exchangeTransaction.js');
const ExchangeStatus = require('./model/modelExchangeStatus.js');
const OrderFilling = require('./model/modelOrderFilling.js');
const { TransferTronNet } = require('./function/usdtTransactions.js');

const { sendCoin } = require('./function/minePlexTransactions.js');
const ReplenishmentMpxXfi = require('./function/mpxXfiTransactions.js');
const SendMpxXfi = ReplenishmentMpxXfi.SendCoin;

const sendLog = require('./helpers/sendLog.js');
const generateButton = require('./helpers/generateButton.js');
const deleteSelectedCoin = require('./helpers/deleteSelectedCoin.js');
const { ControlUserBalance } = require('./helpers/userControl.js');
const circumcisionAmount = require('./helpers/circumcisionAmount.js');
const ReplenishmentArtery = require('./function/arteryTransaction.js');
const dataValidation = require('./validator/dataValidation.js');
const { freezeBalance, unfreezeBalance } = require('./helpers/holdBalanceManager.js');
const { calculateSpotTradeFee } = require('./function/calculateSpotTradeFee.js');
const { getCoinRate, getCurrencyRate } = require('./helpers/getCoinRate.js');
const poolDataValidation = require('./validator/poolDataValidation.js');
const LiquidityPools = require('./model/modelLiquidityPools.js');
const { v4 } = require('uuid');
const { sendMinter, getCoinId, getRouteExchange, getFeeExchange, exchangeMinterTransaction, getPriceCoinInBip } = require('./function/minterTransaction.js');
const exchangeValidator = require('./validator/minterExchangeValidator.js');
const getBalanceCoin = require('./helpers/getBalanceCoin.js');
const ProfitPoolModel = require('./model/profitLiquidityPool.js');
const poolProfitDValidator = require('./validator/withdrawPoolProfirValidator.js');
const poolProfitManagement = require('./helpers/poolProfitManagement.js');

mongoose.connect('mongodb://127.0.0.1/test');

const bot = new TeleBot(config.token);

async function setState(id, status) { UserModel.findOneAndUpdate({ id: id }, { status: status }).then((e) => { }) };

async function pageNavigationButton(id, array, startEl, finishEl) {
  const arr = array.slice(startEl, finishEl)
  list[id] = Array.from(arr);
};

async function updateInfo(nameDocument, searchField, parametr) {
  const a = await nameDocument.findOne(
    { searchField: parametr })
  return a
};

const minimalSum = {
  del: 20,
  dar: 25,
  pro: 100,
  sbt: 100,
  reboot: 5,
  makarovsky: 1,
  btt: 300,
  dixwell: 10,
  avt: 5,
  kharat: 200,
  byacademy: 1,
  patrick: 30,
  itcoin: 50,
  messege: 500,
  rrunion: 150,
  vegvisir: 10,
  fbworld: 15,
  dcschool: 15,
  comcoin: 100,
  mintcandy: 4000000,
  sirius: 35,
  cgttoken: 15,
  genesis: 5,
  taxicoin: 30,
  prosmm: 1,
  sharafi: 1,
  safecoin: 1,
  dtradecoin: 1,
  izicoin: 1,
  gzacademy: 10,
  workout: 5000,
  zaruba: 10,
  magnetar: 100,
  candypop: 1,
  randomx: 60,
  ekology: 150,
  emelyanov: 50,
  belymag: 10,
  doorhan: 1,
  lakshmi: 10,
  ryabinin: 200,
  related: 100,
  monopoly: 5000,
  baroncoin: 1000,
  nashidela: 15,
  irmacoin: 50,
  maritime: 1,
  business: 10,
  randice: 10,
  alleluia: 600,
  hosanna: 600,
  cbgrewards: 1,
  novoselka: 100,
  monkeyclub: 20,
  grandpay: 5,
  magnate: 100,
  crypton: 200000,
  iloveyou: 200,
  bazercoin: 20,
  bazerusd: 20000,
  usdt: 2,
  mine: 2,
  plex: 2,
  ddao: 5,
  mpx: 2,
  xfi: 2,
  artery: 2,
  cashback: 50,
  bip: 100,
  bnb: 0.0001,
  hub: 0.01,
  monsterhub: 0.01,
  usdtbsc: 2
};


//text
bot.on('text', async (msg) => {
  try {
    const userId = msg.from.id;
    const text = msg.text;
    const userName = msg.from.first_name;
    const getInfoUser = await UserManagement.getInfoUser(userId);
    const p2pChatMember = await bot.getChatMember('@p2plogss', userId);
    const bazerChatMember = await bot.getChatMember('@linkproject7765', userId);
    const p2pChannelInclude = !(p2pChatMember.status === 'member' || p2pChatMember.status === 'administrator' || p2pChatMember.status === 'creator');
    const bazerChannelInclude = !(bazerChatMember.status === 'member' || bazerChatMember.status === 'administrator' || bazerChatMember.status === 'creator');

    console.log(`Пользопатель ${userId} отправил сообщение: ${text}`);

    if (text === '/start') {
      if (getInfoUser === "not user") {
        setState(userId, 0);
        await AuthenticationService.Authentication(userId);
        bot.sendMessage(userId, `${userName}, добро пожаловать!\nДля того чтобы продолжить работу с ботом, установите в профиль юзернейм и подпишитесь на каналы ниже:\nhttps://t.me/linkproject7765\nhttps://t.me/p2plogss`, { replyMarkup: RM_Home });
      } else {
        setState(userId, 0);
        bot.sendMessage(userId, `Привет, ${userName}!`, { replyMarkup: RM_Home });
      }
    }

    if (!msg.from.username) return bot.sendMessage(userId, 'Что-бы продолжить работу укажите юзернейм на аккаунте ❗️');

    if (p2pChannelInclude && bazerChannelInclude) return bot.sendMessage(userId, 'Кажется вы не подписаны на наши каналы. Подпишитесь и повторите попытку снова...\nhttps://t.me/linkproject7765\nhttps://t.me/p2plogss');

    switch (text) {
      case 'Мой кабинет 📂':
        setState(userId, 0);
        const quantytyCoin = (Object.keys((await BalanceUserModel.findOne({ id: userId })).main)).length;
        await bot.sendMessage(userId, 'Вы перейшли в свой кабинет!')
          .then(() => bot.sendMessage(userId, `👤 Имя: ${userName}\n🆔 ID: ${userId}\n🏦 Статус:...\n💲 Количество монет в боте: ${quantytyCoin}`, { replyMarkup: cabinetIK }));
        break;

      case 'Спотовая торговля 📒':
        setState(userId, 0);
        bot.sendMessage(userId, 'Выбирете раздел:', { replyMarkup: spotOrderMenu });
        break;

      case 'P2P':
        setState(userId, 0);
        bot.sendMessage(userId, 'Вы перешли в раздел Р2Р', { replyMarkup: p2pMenuIK });
        break;

      case 'Рефералы 👥':
        setState(userId, 0);
        bot.sendMessage(userId, 'Раздел в разработке');

        // async function startTe() {
        //   try {
        //     console.log('Inside startTe function');
        //     const users = await WalletUserModel.find({});
        //     users.map(async (u) => {
        //       // await WalletUserModel.updateOne({ id: u.id }, { $set: { mnemonics: u.del.mnemonics } });

        //       // await WalletUserModel.updateOne(
        //       //   { id: u.id },
        //       //   { $unset: { "del.mnemonics": "" } },
        //       // );

        //       // await WalletUserModel.updateOne(
        //       //   { id: u.id },
        //       //   JSON.parse(`{ "$set": { "minter.address": "${a.address}", "minter.privateKey": "${a.privateKey}" } }`)
        //       // );

        //       // await BalanceUserModel.updateOne(
        //       //   { id: u.id },
        //       //   JSON.parse(`{ "$set" : { "main.hub": "0", "hold.hub": "0", "main.monsterhub": "0", "hold.monsterhub": "0", "main.usdtbsc": "0", "hold.usdtbsc": "0", "main.bnb": "0", "hold.bnb": "0" } }`)
        //       // );
        //     });
        //   } catch (error) {
        //     console.error(error)
        //   }
        // };

        // startTe();
        break;

      case 'Конвертация 🔄':
        bot.sendMessage(userId, 'Выберите блокчейн монеты которого хотите конвертировать: ', { replyMarkup: exchangeIK })
        break;

      case '💲 Стейкинг':
        bot.sendMessage(userId, 'Вы выбрали Стейкинг. Выбирете раздел:', { replyMarkup: stackingIK });
        break;

      case '/admin':
        bot.sendMessage(userId, 'Вы перейшли в админ панель. Перейдите, пожалуйста, по кнопке ниже:', { replyMarkup: adminPanelIK });
        break;

      default:
        const state = getInfoUser.user.status;
        if (!state) return bot.sendMessage(userId, 'Я не знаю что вам ответить.')
        break;
    };

    //states
    if (getInfoUser === "not user") return;
    switch (getInfoUser.user.status) {
      case 10:
        setState(userId, 11);
        amount[userId] = Number(text);

        if (isNaN(amount[userId])) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Введено не коректное число!');
        }

        const comission = (await TransferCommission(decimalMnemonics, decimalWallet, coin[userId], amount[userId])).data.result.result.amount / 1e18;
        sum[userId] = amount[userId] + (comission * 2);

        if (amount[userId] < minimalWithdrawAmount[userId]) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Вы ввели сумму вывода ниже минимальной!', { replyMarkup: RM_Home });
        };

        if (sum[userId] > balanceUserCoin[userId]) {
          setState(userId, 0);
          return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода с комиссией составляет ${sum[userId]} ${coin[userId].toUpperCase()}`, { replyMarkup: RM_Home });
        };
        bot.sendMessage(userId, 'Введите адресс кошелька на который хотите вывести деньги: ');
        break;

      case 11:
        try {
          setState(userId, 0);
          wallet[userId] = text;
          await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${sum[userId]} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK });
        } catch (error) {
          console.error(error)
        }
        break;

      case 12:
        setState(userId, 0);
        exchangeSellAmount[userId] = Number(text);

        if (isNaN(exchangeSellAmount[userId])) {
          setState(userId, 0)
          return bot.sendMessage(userId, 'Введено не коректное число!', { replyMarkup: RM_Home });
        }

        if (balanceUserCoin[userId] < exchangeSellAmount[userId]) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'На вашем балансе не достаточно средств для обмена!', { replyMarkup: RM_Home });
        };

        exchangeBuyAmount[userId] = (rateExchange[userId] * exchangeSellAmount[userId]) + 0.0001;

        const result = (await ExchangeCoinTransaction.exchangeComission(
          decimalMnemonics,
          sellCoin[userId],
          buyCoin[userId],
          exchangeBuyAmount[userId],
          exchangeSellAmount[userId]
        )).data.result.result.amount / 1e18;
        comissionExchanger[userId] = result;
        const textExchange = [
          `Курс: 1 ${sellCoin[userId].toUpperCase()} = ${(rateExchange[userId] + 0.0001).toFixed(4)} ${buyCoin[userId].toUpperCase()}`,
          `Количество продаваемой монеты: ${(exchangeSellAmount[userId]).toFixed(4)} ${sellCoin[userId].toUpperCase()}`,
          `Количество покупаемой монеты: ${exchangeBuyAmount[userId].toFixed(4)} ${buyCoin[userId].toUpperCase()}`,
          `Комиссия составляет ${comissionExchanger[userId]} DEL`
        ].join('\n');
        await bot.sendMessage(userId, textExchange, { replyMarkup: acceptCancelExchangeIK });
        break;

      case 13:
        setState(userId, 14);
        userRate[userId] = circumcisionAmount(Number(text));
        if (isNaN(userRate[userId])) {
          await setState(userId, 0);
          return bot.sendMessage(userId, 'Введенно не коректное число!\nВведите курс по которому будет осуществлена торговля в стиле: <i>0.0001</i>', { parseMode: "html" });
        }
        balanceUserCoin[userId] = getInfoUser.userBalance.main[sellCoin[userId]];
        bot.sendMessage(userId, `Доступно ${balanceUserCoin[userId]} ${sellCoin[userId].toUpperCase()} \nВведите количество продажи монет:`);
        break;

      case 14:
        setState(userId, 0);
        amount[userId] = circumcisionAmount(Number(text));

        if (isNaN(amount[userId])) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Введено не коректное число!', { replyMarkup: RM_Home });
        };

        const feePaymentCurrencyBalance = getInfoUser.userBalance.main.cashback;
        comissionExchanger[userId] = await calculateSpotTradeFee(amount[userId], sellCoin[userId]);

        if (comissionExchanger[userId] > feePaymentCurrencyBalance) {
          setState(userId, 0);
          return await bot.sendMessage(userId, `На вашем балансе не достаточно средств для оплаты комиссии!\nКомиссия составляет ${comissionExchanger[userId]} CASHBACK`, { replyMarkup: RM_Home });
        }

        if (amount[userId] > balanceUserCoin[userId]) {
          setState(userId, 0);
          return await bot.sendMessage(userId, 'На вашем балансе не достаточно средств!', { replyMarkup: RM_Home });
        }

        sum[userId] = circumcisionAmount(amount[userId] * userRate[userId]);
        bot.sendMessage(userId, `Продажа монеты: ${sellCoin[userId].toUpperCase()},
Покупка монеты: ${buyCoin[userId].toUpperCase()},
Курс продажи: 1 ${sellCoin[userId].toUpperCase()} = ${userRate[userId]} ${buyCoin[userId].toUpperCase()},
Количество продажи: ${amount[userId]} ${sellCoin[userId].toUpperCase()},
Количество покупки: ${sum[userId]} ${buyCoin[userId].toUpperCase()},
Комиссия сделки: ${comissionExchanger[userId]} CASHBACK.`, { replyMarkup: generateButton(acceptCancelOrderIK, 'spotTrade') });
        break;

      case 18:
        setState(userId, 19);
        requisites[userId] = Number(text);
        bot.sendMessage(userId, 'Введите количество продажи монеты:');
        break;

      case 19:
        amount[userId] = Number(text);
        if (isNaN(text)) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Введено не коректное число');
        }

        if (orderType[userId] === 'buy') {
          bot.sendMessage(userId, 'Введите минимальную сумму закупки монеты:');
        } else {
          if (text > getInfoUser.userBalance.main[coin[userId]]) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'На вашем балансе не достаточно средств.');
          }

          bot.sendMessage(userId, 'Введите минимальную сумму продажи монеты:');
        }

        setState(userId, 20);
        break;

      case 20:
        setState(userId, 21);
        if (isNaN(text)) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Введено не коректное число');
        };
        sum[userId] = Number(text);

        const rateStockExchange = await getCurrencyRate(coin[userId], currencyP2P[userId]);

        if (orderType[userId] === 'buy') {
          bot.sendMessage(userId, `Курс на биржах: 1 ${coin[userId]} ≈ <code>${rateStockExchange}</code> ${currencyP2P[userId]}. Введите курс закупки монет, курс должен быть в стиле <i>0.0001</i>:`, { parseMode: "html" });
        } else {
          bot.sendMessage(userId, `Курс на биржах: 1 ${coin[userId]} ≈ <code>${rateStockExchange}</code> ${currencyP2P[userId]}. Введите курс продажи монет, курс должен быть в стиле <i>0.0001</i>:`, { parseMode: "html" });
        }
        break;

      case 21:
        setState(userId, 0);

        if (isNaN(text)) return bot.sendMessage(userId, 'Введено не коректное число!');

        userRate[userId] = Number(text);
        orderNumber[userId] = (await CustomP2POrder.countDocuments()) + 1;
        if (orderType[userId] === 'buy') {
          bot.sendMessage(userId, `Ордер № ${orderNumber[userId]},
Тип ордера: ${orderType[userId]},
Покупка монеты: ${coin[userId]},
Количество покупки: ${amount[userId]} ${coin[userId].toUpperCase()},
Минимальная сумма закупки монеты: ${sum[userId]} ${coin[userId].toUpperCase()},
Валюта совершения сделки: ${currencyP2P[userId]},
Способ облаты: ${paymentSystem[userId]},
Курс покупки: ${userRate[userId]} ${currencyP2P[userId]}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'p2p') });
        } else {
          bot.sendMessage(userId, `Ордер № ${orderNumber[userId]},
Тип ордера: ${orderType[userId]},
Продажа монеты: ${coin[userId]},
Количество продажи: ${amount[userId]} ${coin[userId].toUpperCase()},
Минимальная сумма продажи монеты: ${sum[userId]} ${coin[userId].toUpperCase()},
Валюта совершения сделки: ${currencyP2P[userId]},
Способ облаты: ${paymentSystem[userId]},
Курс продажи: ${userRate[userId]} ${currencyP2P[userId]}
Реквизиты: ${requisites[userId]}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'p2p') });
        }
        break;

      case 22:
        break;

      case 23:
        setState(userId, 24);

        if (isNaN(text)) {
          setState(userId, 0);
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно не коректное число!');
        };

        requisites[userId] = Number(text);
        await bot.sendMessage(userId, `Лимит ордера: ${selectedOrder[userId].minAmount} - ${selectedOrder[userId].amount} ${selectedOrder[userId].coin.toUpperCase()}.\nВведите количество продажи монеты:`);
        break;

      case 24:
        setState(userId, 0);

        if (isNaN(text)) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно не коректное число!');
        };

        if (text > getInfoUser.userBalance.main[coin[userId]]) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'На вашем балансе не достаточно средств!');
        }

        if (text < selectedOrder[userId].minAmount) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно количество меньше минимального!');
        };

        if (text > selectedOrder[userId].amount) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно количество больше максимального!');
        };

        amount[userId] = Number(text);

        await OrderFilling.create({
          orderNumber: selectedOrder[userId].orderNumber,
          status: 'Filling',
          processed: false,
          creatorOrder: selectedOrder[userId].id,
          client: userId,
          rate: selectedOrder[userId].rate,
          coin: selectedOrder[userId].coin,
          currency: selectedOrder[userId].currency,
          coinAmount: amount[userId],
          currencyAmount: amount[userId] * selectedOrder[userId].rate,
          requisites: requisites[userId],
        });

        await bot.sendMessage(userId, `Выбран ордер №${selectedOrder[userId].orderNumber},
Количество продажи монеты: ${amount[userId]} ${selectedOrder[userId].coin.toUpperCase()},
Курс совершения операции: ${selectedOrder[userId].rate} ${selectedOrder[userId].currency.toUpperCase()},
Способ оплаты: ${selectedOrder[userId].paymentSystem},
Реквизиты: ${requisites[userId]}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'p2pTradeSell') })
        break;

      case 25:
        setState(userId, 0);

        if (isNaN(text)) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно не коректное число!');
        };

        if (text < selectedOrder[userId].minAmount) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно количество меньше минимального!');
        };

        if (text > selectedOrder[userId].amount) {
          await OrderFilling.deleteOne(
            { orderNumber: selectedOrder[userId].orderNumber }
          );
          await CustomP2POrder.updateOne(
            { orderNumber: selectedOrder[userId].orderNumber },
            { $set: { status: 'Selling' } }
          );
          return bot.sendMessage(userId, 'Введенно количество больше максимального!');
        };

        amount[userId] = Number(text);

        await OrderFilling.create({
          orderNumber: selectedOrder[userId].orderNumber,
          status: 'Filling',
          processed: false,
          creatorOrder: selectedOrder[userId].id,
          client: userId,
          rate: selectedOrder[userId].rate,
          coin: selectedOrder[userId].coin,
          currency: selectedOrder[userId].currency,
          coinAmount: amount[userId],
          currencyAmount: amount[userId] * selectedOrder[userId].rate,
          requisites: 0
        });

        bot.sendMessage(userId, `Выбран ордер №${selectedOrder[userId].orderNumber},
Количество покупки: ${amount[userId]} ${selectedOrder[userId].coin.toUpperCase()},
Курс совершения операции: ${selectedOrder[userId].rate} ${selectedOrder[userId].currency.toUpperCase()},
Способ оплаты: ${selectedOrder[userId].paymentSystem},
Реквизиты для оплаты: ${selectedOrder[userId].requisites}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'p2pTradeBuy') });
        break;

      case 27:
        try {
          amount[userId] = Number(text);

          if (!validator.isNumeric(text)) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Введено не корректное число!');
          }

          if (!validator.isFloat(text, { min: minimalWithdrawAmount[userId] })) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Вы ввели сумму вывода ниже минимальной!', { replyMarkup: RM_Home });
          }

          if ((coin[userId] === 'plex' && amount[userId] > balanceUserCoin[userId] && getInfoUser.userBalance.main.mine < 2) || (coin[userId] === 'mine' && (amount[userId] + 2) > balanceUserCoin[userId])) {
            setState(userId, 0);
            return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} ${coin[userId].toUpperCase()} + 2 MINE з уплату комиссии`, { replyMarkup: RM_Home });
          };
          if (coin[userId] === 'usdt' && (amount[userId] + 2) > balanceUserCoin[userId]) {
            setState(userId, 0);
            return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} USDT + 2 USDT з уплату комиссии`, { replyMarkup: RM_Home });
          };
          if ((coin[userId] === 'xfi' && amount[userId] > balanceUserCoin[userId] && getInfoUser.userBalance.main.mpx < 2) || (coin[userId] === 'mpx' && (amount[userId] + 2) > balanceUserCoin[userId])) {
            setState(userId, 0);
            return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} ${coin[userId].toUpperCase()} + 2 MPX з уплату комиссии`, { replyMarkup: RM_Home });
          };
          if ((coin[userId] === 'bip' && (amount[userId] + 70) > balanceUserCoin[userId]) ||
            (coin[userId] === 'hub' && getInfoUser.userBalance.main.bip < 70) ||
            (coin[userId] === 'monsterhub' && getInfoUser.userBalance.main.bip < 70) ||
            (coin[userId] === 'bnb' && getInfoUser.userBalance.main.bip < 70) ||
            (coin[userId] === 'usdtbsc' && getInfoUser.userBalance.main.bip < 70)) {
            setState(userId, 0);
            return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} ${coin[userId].toUpperCase()} + 70 BIP з уплату комиссии`, { replyMarkup: RM_Home });
          };
          if (coin[userId] === 'artery' && (amount[userId] + 2) > balanceUserCoin[userId]) {
            setState(userId, 0);
            let commission = amount[userId] * 0.10;
            if (commission < 1) {
              commission = 1;
            }
            return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} ARTERY + ${circumcisionAmount(commission)} ARTERY з уплату комиссии`, { replyMarkup: RM_Home });
          }

          bot.sendMessage(userId, 'Введите адресс кошелька на который хотите вывести деньги: ');
          setState(userId, 28);
        } catch (error) {
          console.error(error)
        }
        break;

      case 28:
        try {
          setState(userId, 0);
          wallet[userId] = text;
          if (coin[userId] === 'mine') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${(amount[userId] + 2)} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK });
          }
          else if (coin[userId] === 'plex') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${amount[userId]} ${coin[userId].toUpperCase()} + 2 MINE\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK })
          }
          else if (coin[userId] === 'usdt') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${(amount[userId] + 2)} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK });
          }
          else if (coin[userId] === 'mpx') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${(amount[userId] + 2)} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK });
          }
          else if (coin[userId] === 'xfi') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${amount[userId]} ${coin[userId].toUpperCase()} + 2 MPX\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK })
          }
          else if (coin[userId] === 'bip') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${amount[userId] + 70} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK })
          }
          else if (
            coin[userId] === 'hub' ||
            coin[userId] === 'monsterhub' ||
            coin[userId] === 'bnb' ||
            coin[userId] === 'usdtbsc') {
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${amount[userId]} ${coin[userId].toUpperCase()} + 70 BIP\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK })
          }
          else if (coin[userId] === 'artery') {
            let commission = amount[userId] * 0.10;
            if (commission < 1) {
              commission = 1;
            }
            await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${amount[userId]} ARTERY + ${circumcisionAmount(commission)} ARTERY\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK })
          }
        } catch (error) {
          console.error(error)
        }
        break;

      case 29:
        setState(userId, 0);
        amount[userId] = text;
        const validationSellResult = await dataValidation(userId, amount[userId], sellCoin[userId]);

        if (validationSellResult.success) {
          if (amount[userId] > number[userId]) return bot.sendMessage(userId, 'Сумма покупки монеты указана больше чем в ордере!');

          const balanceCashback = getInfoUser.userBalance.main.cashback;
          comissionExchanger[userId] = await calculateSpotTradeFee(amount[userId], sellCoin[userId]);

          if (comissionExchanger[userId] > balanceCashback) {
            setState(userId, 0);
            return await bot.sendMessage(userId, `На вашем балансе не достаточно средств для оплаты комиссии!\nКомиссия составляет ${comissionExchanger[userId]} CASHBACK`, { replyMarkup: RM_Home });
          };

          sum[userId] = circumcisionAmount(amount[userId] * userRate[userId]);
          const mesg = `Продажа монеты: ${sellCoin[userId].toUpperCase()},
Покупка монеты: ${buyCoin[userId].toUpperCase()},
Курс продажи: 1 ${sellCoin[userId].toUpperCase()} = ${userRate[userId]} ${buyCoin[userId].toUpperCase()},
Количество продажи: ${amount[userId]} ${sellCoin[userId].toUpperCase()},
Количество покупки: ${sum[userId]} ${buyCoin[userId].toUpperCase()},
Комиссия сделки: ${comissionExchanger[userId]} CASHBACK.`;

          await bot.sendMessage(userId, mesg, { replyMarkup: generateButton(acceptCancelOrderIK, 'spotTrade') });
        } else {
          await bot.sendMessage(userId, validationSellResult.errorMessage);
        }
        break;

      case 26:
        setState(userId, 0);
        amount[userId] = text;
        const isValidPoolData = await poolDataValidation(userId, amount[userId], sellCoin[userId]);

        if (!isValidPoolData.status) return bot.sendMessage(userId, isValidPoolData.errorMessage);

        const acceptCancelPoolArr = ['accept', 'cancel'];

        const createPoolMesg = `Торговля осуществляется по рыночной цене.
Пара: ${sellCoin[userId].toUpperCase()}/${buyCoin[userId].toUpperCase()},
Количество монет для пула: ${amount[userId]} ${sellCoin[userId].toUpperCase()}.`;
        bot.sendMessage(userId, createPoolMesg, { replyMarkup: generateButton(acceptCancelPoolArr, 'createPool') });
        break;

      case 17:
        setState(userId, 0);
        if (isNaN(text)) return bot.sendMessage(userId, 'Введено не корректное число!');
        exchangeSellAmount[userId] = +text;
        const sellCoinId = await getCoinId(sellCoin[userId]);
        const buyCoinId = await getCoinId(buyCoin[userId]);
        const audit = Number.isInteger(exchangeSellAmount[userId]);

        if (!audit) return bot.sendMessage(userId, 'Введенное число не является целым!');

        const stringRouteArray = await getRouteExchange(sellCoinId, buyCoinId, exchangeSellAmount[userId]);
        exchangeRoute[userId] = stringRouteArray.map(str => +str);

        comissionExchanger[userId] = await getFeeExchange(exchangeRoute[userId], exchangeSellAmount[userId]);
        if (!comissionExchanger[userId]) return bot.sendMessage(userId, 'Возникла ошибка, попробуйте попытку позже.');
        const resultExchangeMinterValidation = await exchangeValidator(userId, exchangeSellAmount[userId], sellCoin[userId], comissionExchanger[userId]);

        if (!resultExchangeMinterValidation.status) return bot.sendMessage(userId, resultExchangeMinterValidation.errorMessage);

        exchangeBuyAmount[userId] = exchangeSellAmount[userId] * rateExchange[userId]
        const textMinterExchange = [
          `Курс: 1 ${sellCoin[userId].toUpperCase()} = ${rateExchange[userId]} ${buyCoin[userId].toUpperCase()}`,
          `Количество продажи монеты: ${(exchangeSellAmount[userId]).toFixed(4)} ${sellCoin[userId].toUpperCase()}`,
          `Количество покупки монеты: ${exchangeBuyAmount[userId].toFixed(4)} ${buyCoin[userId].toUpperCase()}`,
          `Комиссия составляет ${comissionExchanger[userId]} BIP.`
        ].join('\n');

        const arrAnswer = ['accept', 'cancel']
        bot.sendMessage(userId, textMinterExchange, { replyMarkup: generateButton(arrAnswer, 'minterExchange') });
        break;


      case 15:
        setState(userId, 0);
        amount[userId] = +text;
        const validationProfitPool = await poolProfitDValidator(userId, amount[userId]);

        if (!validationProfitPool.status) return bot.sendMessage(userId, validationProfitPool.errorMessage);

        const choice = ['accept', 'cancel'];

        await bot.sendMessage(userId, `Выполнить вывод прибыли из пулов ликвидности в размере ${amount[userId]} CASHBACK?`, { replyMarkup: generateButton(choice, 'withdrawPoolProfit') });
        break;

      case 16:
        break;

      default:
        break;
    };

  } catch (error) {
    console.error(error);
  }
});

//callbacks
bot.on('callbackQuery', async (msg) => {
  try {
    const data = msg.data;
    const userId = msg.from.id;
    const messageId = msg.message.message_id;
    const getInfoUser = await UserManagement.getInfoUser(userId);
    const arrayCoinList = Object.keys((await BalanceUserModel.findOne({ id: userId })).main);
    const firstPage = arrayCoinList.slice(0, 20);

    console.log(data);

    const textBalance = [
      '💵 Балансы:',
      `USDT: ${circumcisionAmount(getInfoUser.userBalance.main.usdt)}`,
      `BIP: ${circumcisionAmount(getInfoUser.userBalance.main.bip)}`,
      `HUB: ${circumcisionAmount(getInfoUser.userBalance.main.hub)}`,
      `MONSTERHUB: ${circumcisionAmount(getInfoUser.userBalance.main.monsterhub)}`,
      `BNB: ${circumcisionAmount(getInfoUser.userBalance.main.bnb)}`,
      `USDTBSC: ${circumcisionAmount(getInfoUser.userBalance.main.usdtbsc)}`,
      `MINE: ${circumcisionAmount(getInfoUser.userBalance.main.mine)}`,
      `PLEX: ${circumcisionAmount(getInfoUser.userBalance.main.plex)}`,
      `MPX: ${circumcisionAmount(getInfoUser.userBalance.main.mpx)}`,
      `XFI: ${circumcisionAmount(getInfoUser.userBalance.main.xfi)}`,
      `ARTERY: ${circumcisionAmount(getInfoUser.userBalance.main.artery)}`,
      `CASHBACK: ${circumcisionAmount(getInfoUser.userBalance.main.cashback)}`,
      `DEL: ${circumcisionAmount(getInfoUser.userBalance.main.del)}`,
      `DDAO: ${circumcisionAmount(getInfoUser.userBalance.main.ddao)}`,
      `BAZERCOIN: ${circumcisionAmount(getInfoUser.userBalance.main.bazercoin)}`,
      `BAZERUSD: ${circumcisionAmount(getInfoUser.userBalance.main.bazerusd)}`,
      `PRO: ${circumcisionAmount(getInfoUser.userBalance.main.pro)}`,
      `DAR: ${circumcisionAmount(getInfoUser.userBalance.main.dar)}`,
      `SBT: ${circumcisionAmount(getInfoUser.userBalance.main.sbt)}`,
      `REBOOT: ${circumcisionAmount(getInfoUser.userBalance.main.reboot)}`,
      `MAKAROVSKY: ${circumcisionAmount(getInfoUser.userBalance.main.makarovsky)}`,
      `BTT: ${circumcisionAmount(getInfoUser.userBalance.main.btt)}`,
      `DIXWELL: ${circumcisionAmount(getInfoUser.userBalance.main.dixwell)}`,
      `AVT: ${circumcisionAmount(getInfoUser.userBalance.main.avt)}`,
      `KHARAT: ${circumcisionAmount(getInfoUser.userBalance.main.kharat)}`,
      `BYACADEMY: ${circumcisionAmount(getInfoUser.userBalance.main.byacademy)}`,
      `PATRICK: ${circumcisionAmount(getInfoUser.userBalance.main.patrick)}`,
      `ITCOIN: ${circumcisionAmount(getInfoUser.userBalance.main.itcoin)}`,
      `MESSEGE: ${circumcisionAmount(getInfoUser.userBalance.main.messege)}`,
      `RRUNION: ${circumcisionAmount(getInfoUser.userBalance.main.rrunion)}`,
      `VEGVISIR: ${circumcisionAmount(getInfoUser.userBalance.main.vegvisir)}`,
      `FBWORLD: ${circumcisionAmount(getInfoUser.userBalance.main.fbworld)}`,
      `DCSCHOOL: ${circumcisionAmount(getInfoUser.userBalance.main.dcschool)}`,
      `COMCOIN: ${circumcisionAmount(getInfoUser.userBalance.main.comcoin)}`,
      `MINTCANDY: ${circumcisionAmount(getInfoUser.userBalance.main.mintcandy)}`,
      `SIRIUS: ${circumcisionAmount(getInfoUser.userBalance.main.sirius)}`,
      `CGTTOKEN: ${circumcisionAmount(getInfoUser.userBalance.main.cgttoken)}`,
      `GENESIS: ${circumcisionAmount(getInfoUser.userBalance.main.genesis)}`,
      `TAXICOIN: ${circumcisionAmount(getInfoUser.userBalance.main.taxicoin)}`,
      `PROSMM: ${circumcisionAmount(getInfoUser.userBalance.main.prosmm)}`,
      `SHARAFI: ${circumcisionAmount(getInfoUser.userBalance.main.sharafi)}`,
      `SAFECOIN: ${circumcisionAmount(getInfoUser.userBalance.main.safecoin)}`,
      `DTRADECOIN: ${circumcisionAmount(getInfoUser.userBalance.main.dtradecoin)}`,
      `IZICOIN: ${circumcisionAmount(getInfoUser.userBalance.main.izicoin)}`,
      `GZACADEMY: ${circumcisionAmount(getInfoUser.userBalance.main.gzacademy)}`,
      `WORKOUT: ${circumcisionAmount(getInfoUser.userBalance.main.workout)}`,
      `ZARUBA: ${circumcisionAmount(getInfoUser.userBalance.main.zaruba)}`,
      `MAGNETAR: ${circumcisionAmount(getInfoUser.userBalance.main.magnetar)}`,
      `CANDYPOP: ${circumcisionAmount(getInfoUser.userBalance.main.candypop)}`,
      `RANDOMX: ${circumcisionAmount(getInfoUser.userBalance.main.randomx)}`,
      `EKOLOGY: ${circumcisionAmount(getInfoUser.userBalance.main.ekology)}`,
      `EMELYANOV: ${circumcisionAmount(getInfoUser.userBalance.main.emelyanov)}`,
      `BELYMAG: ${circumcisionAmount(getInfoUser.userBalance.main.belymag)}`,
      `DOORHAN: ${circumcisionAmount(getInfoUser.userBalance.main.doorhan)}`,
      `LAKSHMI: ${circumcisionAmount(getInfoUser.userBalance.main.lakshmi)}`,
      `RYABININ: ${circumcisionAmount(getInfoUser.userBalance.main.ryabinin)}`,
      `RELATED: ${circumcisionAmount(getInfoUser.userBalance.main.related)}`,
      `MONOPOLY: ${circumcisionAmount(getInfoUser.userBalance.main.monopoly)}`,
      `BARONCOIN: ${circumcisionAmount(getInfoUser.userBalance.main.baroncoin)}`,
      `NASHIDELA: ${circumcisionAmount(getInfoUser.userBalance.main.nashidela)}`,
      `IRMACOIN: ${circumcisionAmount(getInfoUser.userBalance.main.irmacoin)}`,
      `MARITIME: ${circumcisionAmount(getInfoUser.userBalance.main.maritime)}`,
      `BUSINESS: ${circumcisionAmount(getInfoUser.userBalance.main.business)}`,
      `RANDICE: ${circumcisionAmount(getInfoUser.userBalance.main.randice)}`,
      `ALLELUIA: ${circumcisionAmount(getInfoUser.userBalance.main.alleluia)}`,
      `HOSANNA: ${circumcisionAmount(getInfoUser.userBalance.main.hosanna)}`,
      `CBGREWARDS: ${circumcisionAmount(getInfoUser.userBalance.main.cbgrewards)}`,
      `NOVOSELKA: ${circumcisionAmount(getInfoUser.userBalance.main.novoselka)}`,
      `MONKEYCLUB: ${circumcisionAmount(getInfoUser.userBalance.main.monkeyclub)}`,
      `GRANDPAY: ${circumcisionAmount(getInfoUser.userBalance.main.grandpay)}`,
      `MAGNATE: ${circumcisionAmount(getInfoUser.userBalance.main.magnate)}`,
      `CRYPTON: ${circumcisionAmount(getInfoUser.userBalance.main.crypton)}`,
      `ILOVEYOU: ${circumcisionAmount(getInfoUser.userBalance.main.iloveyou)}`,

    ];

    switch (data) {
      case 'balance':
        await pageNavigationButton(userId, textBalance, 0, 20);
        await bot.editMessageText({ chatId: userId, messageId: messageId }, list[userId].join('\n'), { replyMarkup: balanceStartPageIK });
        break;

      case 'balance_page2':
        await pageNavigationButton(userId, textBalance, 20, 40);
        await bot.editMessageText({ chatId: userId, messageId: messageId }, list[userId].join('\n'), { replyMarkup: balancePage2IK }).catch((errr) => console.log(errr))
        break;

      case 'balance_page3':
        await pageNavigationButton(userId, textBalance, 40, 60);
        await bot.editMessageText({ chatId: userId, messageId: messageId }, list[userId].join('\n'), { replyMarkup: balancePage3IK });
        break;

      case 'balance_page4':
        bot.deleteMessage(userId, messageId);
        await pageNavigationButton(userId, textBalance, 60, textBalance.length);
        await bot.editMessageText({ chatId: userId, messageId: messageId }, list[userId].join('\n'), { replyMarkup: balancePage4IK });
        break;

      case 'user_replenishment':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2');
        bot.sendMessage(userId, 'Выберите валюту пополнения:', { replyMarkup: generateButton(firstPage, 'replenishment') });
        break;

      case 'user_withdrawal':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2');
        bot.sendMessage(userId, 'Выберите валюту вывода:', { replyMarkup: generateButton(firstPage, 'withdrawal') });
        break;

      case 'main_menu':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'accept_withdrawal':
        try {
          if (coin[userId] === 'mine' || coin[userId] === 'plex') {
            try {
              bot.deleteMessage(userId, messageId);
              const sendMinePlex = await sendCoin(config.adminMinePlexSk, wallet[userId], amount[userId], coin[userId]);
              if (sendMinePlex.data.error) return bot.sendMessage(userId, 'При выводе возникла ошибка', { replyMarkup: RM_Home });
              coin[userId] === 'mine' ? await ControlUserBalance(userId, coin[userId], -(amount[userId] + 2)) :
                (await ControlUserBalance(userId, coin[userId], -amount[userId]), await ControlUserBalance(userId, 'mine', -2))
              await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendMinePlex.data.transaction.hash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
              return await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} ${coin[userId]}\nTxHash: <code>${sendMinePlex.data.transaction.hash}</code>`)

            } catch (error) {
              console.error(error)
            };
          }
          if (coin[userId] === 'mpx' || coin[userId] === 'xfi') {
            try {
              bot.deleteMessage(userId, messageId);
              const sendMpxXfi = await SendMpxXfi(config.adminMnemonicMinePlex, wallet[userId], coin[userId], amount[userId]);
              coin[userId] === 'mpx' ? await ControlUserBalance(userId, coin[userId], -(amount[userId] + 2)) :
                (await ControlUserBalance(userId, coin[userId], -amount[userId]), await ControlUserBalance(userId, 'mpx', -2))
              await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendMpxXfi}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
              return await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} ${coin[userId]}\nTxHash: <code>${sendMpxXfi}</code>`)
            } catch (error) {
              console.error(error);
              bot.sendMessage(userId, 'При выводе возникла ошибка', { replyMarkup: RM_Home });
            }
          }
          if (coin[userId] === 'usdt') {
            try {
              bot.deleteMessage(userId, messageId);
              const sendUsdtHash = await TransferTronNet(config.adminPrivateKeyUsdt, config.contractUsdt, wallet[userId], amount[userId]);
              await ControlUserBalance(userId, coin[userId], -(amount[userId] + 2));
              await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendUsdtHash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
              return await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} ${coin[userId]}\nTxHash: <code>${sendUsdtHash}</code>`)
            } catch (error) {
              console.error(error)
            };
          }
          if (coin[userId] === 'artery') {
            try {
              bot.deleteMessage(userId, messageId);
              const sendArteryHash = await ReplenishmentArtery.sendArtery(config.adminArteryMnemonic, wallet[userId], amount[userId]);

              let commission = amount[userId] * 0.10;
              if (commission < 1) {
                commission = 1;
              }
              await ControlUserBalance(userId, coin[userId], -(amount[userId] + commission));
              await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendArteryHash.txhash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
              return await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} ${coin[userId]}\nTxHash: <code>${sendArteryHash}</code>`);
            } catch (error) {
              console.error(error)
            }
          }
          if (coin[userId] === 'bip' ||
            coin[userId] === 'hub' ||
            coin[userId] === 'monsterhub' ||
            coin[userId] === 'bnb' ||
            coin[userId] === 'usdtbsc') {
            bot.deleteMessage(userId, messageId);
            const sendBipResult = await sendMinter(wallet[userId], amount[userId], config.adminMinterMnemonic, coin[userId]);

            if (sendBipResult.status) {
              if (coin[userId] === 'bip') {
                bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendBipResult.hash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
                await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} BIP\nTxHash: <code>${sendBipResult.hash}</code>`);
                await ControlUserBalance(userId, coin[userId], -(amount[userId] + 70));
              } else {
                bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendBipResult.hash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
                await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} ${(coin[userId]).toUpperCase()}\nTxHash: <code>${sendBipResult.hash}</code>`);
                await ControlUserBalance(userId, coin[userId], -amount[userId]);
                await ControlUserBalance(userId, 'bip', -70);
              }
            } else {
              bot.sendMessage(userId, 'Возникла ошибка при выводе, попробуйте попытку позже. Если проблема не исчезнет обратитесь в техподдержку.')
            }

          } else {
            bot.deleteMessage(userId, messageId);
            const sendCoinUser = await SendCoin(decimalMnemonics, wallet[userId], coin[userId], amount[userId]);
            if (sendCoinUser.data.result.result.tx_response.code != 0) return bot.sendMessage(userId, 'При выводе возникла ошибка', { replyMarkup: RM_Home });
            await ControlUserBalance(userId, coin[userId], -sum[userId]);
            await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendCoinUser.data.result.result.tx_response.txhash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html' });
            return await sendLog(`Пользователь ${userId} успешно вывел ${amount[userId]} ${coin[userId]}\nTxHash: <code>${sendCoinUser.data.result.result.tx_response.txhash}</code>`)
          }
        } catch (error) {
          console.error(error)
        }
        break;

      case 'cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'accept_exchange':
        try {
          bot.deleteMessage(userId, messageId);
          await bot.sendMessage(userId, 'Идет процесс обмена... Ожидайте');

          if (comissionExchanger[userId] > getInfoUser.userBalance.main.del) {
            return bot.sendMessage(userId, 'На вашем балансе не достаточно средств для оплаты комисси!', { replyMarkup: RM_Home });
          };

          const exchangeTransaction = (await ExchangeCoinTransaction.exchangeTransaction(
            decimalMnemonics,
            sellCoin[userId],
            buyCoin[userId],
            exchangeBuyAmount[userId],
            exchangeSellAmount[userId]
          )).data.result.result;

          if (exchangeTransaction.tx_response.code != 0) return bot.sendMessage(userId, 'При обмене возникла ошибка!', { replyMarkup: RM_Home });

          await ExchangeStatus.create({
            id: userId,
            hash: exchangeTransaction.tx_response.txhash,
            status: 'ExchangeCheck',
            processed: false,
            coinSell: sellCoin[userId],
            coinBuy: buyCoin[userId]
          })
          console.log('exchangerCheck model created');

        } catch (error) {
          console.error(error)
        }
        break;

      case 'created_SpotOrders':
        try {
          bot.deleteMessage(userId, messageId);
          const userOrder = (await CustomOrder.find({ id: userId })).filter(order => !(order.status === 'Done' || order.status === 'Deleted'))

          if (userOrder.length === 0) {
            return bot.sendMessage(userId, 'На площадке не торгуется ни один ордер 😞');
          }

          userOrder.forEach(order => {
            const settingsOrderIK = bot.inlineKeyboard([
              [bot.inlineButton('Удалить ❌', { callback: `deleteOrder_${order.orderNumber}` })]
            ])

            bot.sendMessage(userId, `Ордер №${order.orderNumber},
Статус: ${order.status},
Продажа монеты: ${order.sellCoin.toUpperCase()},
Покупка монеты: ${order.buyCoin.toUpperCase()},
Сумма покупки: ${circumcisionAmount(order.buyAmount)} ${order.buyCoin.toUpperCase()},
Сумма продажи: ${circumcisionAmount(order.sellAmount)} ${order.sellCoin.toUpperCase()},
Курс осуществления операции: 1 ${order.sellCoin.toUpperCase()} = ${circumcisionAmount(order.rate)} ${order.buyCoin.toUpperCase()}.`, { replyMarkup: settingsOrderIK });
          })
        } catch (error) {
          console.error(error)
        }
        break;

      case 'completed_SpotOrders':
        try {
          bot.deleteMessage(userId, messageId);
          const userOrder = (await CustomOrder.find({ id: userId })).filter(order => !(order.status === 'Selling'));

          if (userOrder.length === 0) {
            return bot.sendMessage(userId, 'У вас не сработал еще ни один ордер 😞');
          }

          const messageUserOrder = userOrder
            .map(order => {
              return `Ордер №${order.orderNumber},
Статус: ${order.status},
Продажа монеты: ${order.sellCoin.toUpperCase()},
Покупка монеты: ${order.buyCoin.toUpperCase()},
Сумма покупки: ${order.buyAmount} ${order.buyCoin.toUpperCase()},
Сумма продажи: ${order.sellAmount} ${order.sellCoin.toUpperCase()},
Курс осуществления операции: 1 ${order.sellCoin.toUpperCase()} = ${order.rate} ${order.buyCoin.toUpperCase()}.\n\n`;
            })
            .join('');

          await bot.sendMessage(userId, messageUserOrder);
        } catch (error) {
          console.error(error)
        }
        break;

      case 'list_SpotOrders':
        bot.deleteMessage(userId, messageId);
        const listOrder = await CustomOrder.find({});
        const filteredArray = listOrder.filter(order => !(order.status === 'Done' || (order.status === 'Deleted')));

        if (filteredArray.length === 0) return bot.sendMessage(userId, 'Сейчас на площадке нету ни 1 ордера.')

        filteredArray.forEach(order => {
          const selectSpotOrder = bot.inlineKeyboard([
            [bot.inlineButton('Создать встречный ордер ✅', { callback: `createCounterOrder_${order.orderNumber}` })]
          ])

          bot.sendMessage(userId,
            `Ордер №${order.orderNumber},
Статус: ${order.status},
Продажа монеты: ${order.sellCoin.toUpperCase()},
Покупка монеты: ${order.buyCoin.toUpperCase()},
Сумма покупки: ${circumcisionAmount(order.buyAmount)} ${order.buyCoin.toUpperCase()},
Сумма продажи: ${circumcisionAmount(order.sellAmount)} ${order.sellCoin.toUpperCase()},
Курс осуществления операции: 1 ${order.sellCoin.toUpperCase()} = ${circumcisionAmount(order.rate)} ${order.buyCoin.toUpperCase()}.\n\n`,
            { replyMarkup: selectSpotOrder });
        });
        break;

      case 'new_SpotOrders':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2')
        orderType[userId] = 'sell';
        await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(firstPage, 'sell') });
        break;

      case 'spotTrade_accept':
        bot.deleteMessage(userId, messageId);
        const spotTradeOrderNumber = (await CustomOrder.countDocuments()) + 1;

        await CustomOrder.create({
          id: userId,
          orderNumber: spotTradeOrderNumber,
          status: 'Selling',
          sellCoin: sellCoin[userId],
          buyCoin: buyCoin[userId],
          sellAmount: amount[userId],
          buyAmount: sum[userId],
          rate: userRate[userId],
          comission: comissionExchanger[userId]
        });

        await freezeBalance(userId, amount[userId], sellCoin[userId]);
        await freezeBalance(userId, comissionExchanger[userId], 'cashback');
        await bot.sendMessage(userId, `Ордер №${spotTradeOrderNumber} успешно создан ✅`, { replyMarkup: RM_Home });
        await sendLog(`Пользователь ${userId} создал ордер спотовой торговли №${spotTradeOrderNumber}`)

        break;

      case 'spotTrade_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'p2p_back':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы перешли в раздел Р2Р:', { replyMarkup: p2pMenuIK });
        break;

      case 'new_p2pOrders':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Выберите тип ордера:', { replyMarkup: typeP2POrder });
        break;

      case 'created_p2pOrders':
        bot.deleteMessage(userId, messageId);
        const userP2POrder = (await CustomP2POrder.find({ id: userId })).filter(order => !(order.status === 'Done' || order.status === 'Deleted'));
        if (userP2POrder.length === 0) return bot.sendMessage(userId, 'Сейчас на площадке не торгуется ни 1 ордер 😞');

        for (let i = 0; i < userP2POrder.length; i++) {
          const deleteP2PIK = bot.inlineKeyboard([
            [bot.inlineButton('Удалить ордер ❌', { callback: `deleteP2P_${userP2POrder[i].orderNumber}` })]
          ]);
          const messageP2PUserOrder = `Ордер №${userP2POrder[i].orderNumber},
Тип ордера: ${userP2POrder[i].type},
Статус: ${userP2POrder[i].status},
Покупка монеты: ${userP2POrder[i].coin},
Количество покупки: ${userP2POrder[i].amount} ${userP2POrder[i].coin},
Минимальная сумма закупки монеты: ${userP2POrder[i].minAmount} ${userP2POrder[i].coin},
Валюта совершения сделки: ${userP2POrder[i].currency},
Способ оплаты: ${userP2POrder[i].paymentSystem},
Курс покупки: ${userP2POrder[i].rate} ${userP2POrder[i].currency.toUpperCase()}.`
          await bot.sendMessage(userId, messageP2PUserOrder, { replyMarkup: deleteP2PIK });
        };
        break;

      case 'buyList_p2pOrders':
        orderType[userId] = 'buy';
        bot.deleteMessage(userId, messageId);
        const buyAllP2POrder = (await CustomP2POrder.find({ type: 'sell' })).filter((orders) => !(orders.status === 'Done' || orders.status === 'Filling' || orders.status === 'Deleted'));
        if (buyAllP2POrder.length === 0) return bot.sendMessage(userId, 'На данный момент на площадке нету ни 1 ордера такого типа 😞');

        for (let i = 0; i < buyAllP2POrder.length; i++) {

          const startTradingIK = bot.inlineKeyboard([
            [bot.inlineButton('Купить', { callback: `p2pTrade_${buyAllP2POrder[i].orderNumber}` })]
          ]);

          // если создатель ордера пользователь
          if (Number(buyAllP2POrder[i].id) === userId) {

            const messageP2PBuyUserOrder = `Ордер №${buyAllP2POrder[i].orderNumber} (you),
Покупка монеты: ${buyAllP2POrder[i].coin},
Количество покупки: ${buyAllP2POrder[i].amount} ${buyAllP2POrder[i].coin},
Минимальная сумма закупки монеты: ${buyAllP2POrder[i].minAmount} ${buyAllP2POrder[i].coin},
Валюта совершения сделки: ${buyAllP2POrder[i].currency},
Способ оплаты: ${buyAllP2POrder[i].paymentSystem},
Курс покупки: ${buyAllP2POrder[i].rate} ${buyAllP2POrder[i].currency.toUpperCase()}.`;

            bot.sendMessage(userId, messageP2PBuyUserOrder);
          } else {
            const messageP2PBuyOrder = `Ордер №${buyAllP2POrder[i].orderNumber},
Покупка монеты: ${buyAllP2POrder[i].coin},
Количество покупки: ${buyAllP2POrder[i].amount} ${buyAllP2POrder[i].coin},
Минимальная сумма закупки монеты: ${buyAllP2POrder[i].minAmount} ${buyAllP2POrder[i].coin},
Валюта совершения сделки: ${buyAllP2POrder[i].currency},
Способ оплаты: ${buyAllP2POrder[i].paymentSystem},
Курс покупки: ${buyAllP2POrder[i].rate} ${buyAllP2POrder[i].currency.toUpperCase()}.`;

            await bot.sendMessage(userId, messageP2PBuyOrder, { replyMarkup: startTradingIK });
          };
        };
        break;

      case 'sellList_p2pOrders':
        setState(userId, 22);
        orderType[userId] = 'sell';
        bot.deleteMessage(userId, messageId);
        const sellAllP2POrder = (await CustomP2POrder.find({ type: 'buy' })).filter((orders) => !(orders.status === 'Done' || orders.status === 'Filling' || orders.status === 'Deleted'));
        if (sellAllP2POrder.length === 0) return bot.sendMessage(userId, 'На данный момент на площадке нету ни 1 ордера такого типа 😞');

        for (let i = 0; i < sellAllP2POrder.length; i++) {

          const startSellTradingIK = bot.inlineKeyboard([
            [bot.inlineButton('Продать', { callback: `p2pTrade_${sellAllP2POrder[i].orderNumber}` })]
          ]);

          // если создатель ордера пользователь
          if (Number(sellAllP2POrder[i].id) === userId) {
            const messageP2PSellUserOrder = `Ордер №${sellAllP2POrder[i].orderNumber} (you),
Продажа монеты: ${sellAllP2POrder[i].coin},
Количество продажи: ${sellAllP2POrder[i].amount} ${sellAllP2POrder[i].coin},
Минимальная сумма продажи монеты: ${sellAllP2POrder[i].minAmount} ${sellAllP2POrder[i].coin},
Валюта совершения сделки: ${sellAllP2POrder[i].currency},
Способ оплаты: ${sellAllP2POrder[i].paymentSystem},
Курс продажи: ${sellAllP2POrder[i].rate} ${sellAllP2POrder[i].currency.toUpperCase()}.`

            bot.sendMessage(userId, messageP2PSellUserOrder)
          } else {
            const messageP2PSellOrder = `Ордер №${sellAllP2POrder[i].orderNumber},
Продажа монеты: ${sellAllP2POrder[i].coin},
Количество продажи: ${sellAllP2POrder[i].amount} ${sellAllP2POrder[i].coin},
Минимальная сумма продажи монеты: ${sellAllP2POrder[i].minAmount} ${sellAllP2POrder[i].coin},
Валюта совершения сделки: ${sellAllP2POrder[i].currency},
Способ оплаты: ${sellAllP2POrder[i].paymentSystem},
Курс продажи: ${sellAllP2POrder[i].rate} ${sellAllP2POrder[i].currency.toUpperCase()}.`

            bot.sendMessage(userId, messageP2PSellOrder, { replyMarkup: startSellTradingIK })
          };
        };
        break;

      case 'p2pBuy':
        bot.deleteMessage(userId, messageId);
        orderType[userId] = 'buy';
        firstPage.push('Page2')
        await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(firstPage, 'buyP2P') });
        break;

      case 'p2pSell':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2')
        orderType[userId] = 'sell';
        await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(firstPage, 'sellP2P') });
        break;

      case 'p2p_accept':
        bot.deleteMessage(userId, messageId);
        if (orderType[userId] === 'sell') {
          CustomP2POrder.create({
            id: userId,
            orderNumber: orderNumber[userId],
            typeOrder: 'p2p',
            type: orderType[userId],
            status: 'Selling',
            coin: coin[userId],
            currency: currencyP2P[userId],
            amount: amount[userId],
            rate: userRate[userId],
            minAmount: sum[userId],
            paymentSystem: paymentSystem[userId],
            requisites: requisites[userId]
          });

          await freezeBalance(userId, amount[userId], coin[userId]);

        } else {
          CustomP2POrder.create({
            id: userId,
            orderNumber: orderNumber[userId],
            typeOrder: 'p2p',
            type: orderType[userId],
            status: 'Selling',
            coin: coin[userId],
            currency: currencyP2P[userId],
            amount: amount[userId],
            rate: userRate[userId],
            minAmount: sum[userId],
            paymentSystem: paymentSystem[userId],
            requisites: 0
          });
        };
        await bot.sendMessage(userId, 'Ордер успешно создан ✅', { replyMarkup: RM_Home });
        await sendLog(`Пользователь ${userId} создал P2P ордер типа ${orderType[userId]} №${orderNumber[userId]}`)
        break;

      case 'p2p_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Отменено ❌ Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'backP2Pmenu':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы перешли в раздел Р2Р:', { replyMarkup: p2pMenuIK });
        break;

      case 'p2pTradeBuy_accept':
        bot.deleteMessage(userId, messageId);
        sum[userId] = selectedOrder[userId].rate * amount[userId];
        await OrderFilling.updateOne(
          { orderNumber: selectedOrder[userId].orderNumber },
          { $set: { status: "Approve" } }
        );
        await bot.sendMessage(userId, `Переведите ${sum[userId]} ${selectedOrder[userId].currency} на банковский счет <code><i>${selectedOrder[userId].requisites}</i></code>. После оплаты нажмите кнопку готово.`, { replyMarkup: payOrder, parseMode: 'html' });
        break;

      case 'p2pTradeBuy_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        await OrderFilling.deleteOne(
          { orderNumber: selectedOrder[userId].orderNumber }
        );
        await CustomP2POrder.updateOne(
          { orderNumber: selectedOrder[userId].orderNumber },
          { $set: { status: 'Selling' } }
        );
        bot.sendMessage(userId, 'Операция отменена!');
        break;

      case 'payOrderCancel':
        bot.deleteMessage(userId, messageId);
        await OrderFilling.deleteOne(
          { orderNumber: selectedOrder[userId].orderNumber }
        );
        await CustomP2POrder.updateOne(
          { orderNumber: selectedOrder[userId].orderNumber },
          { $set: { status: 'Selling' } }
        );
        await bot.sendMessage(userId, 'Операция отменена!')
        break;

      case 'payOrderAccept':
        bot.deleteMessage(userId, messageId);
        const OrderData = await OrderFilling.findOne({ orderNumber: selectedOrder[userId].orderNumber });
        await OrderFilling.updateOne(
          { orderNumber: selectedOrder[userId].orderNumber },
          { $set: { status: 'Accept' } }
        );
        await bot.sendMessage(userId, 'Вы оплатили ордер, ожидайте перевод монет на аккаунт 2 стороной');
        await bot.sendMessage(selectedOrder[userId].id, `Покупатель оплатил ордер, сумма покупки ${OrderData.coinAmount} ${OrderData.coin} = ${OrderData.currencyAmount} ${OrderData.currency}\nПереведите монеты на его счет`, { replyMarkup: generateButton(payOrderCoin, `p2pSendCoin_${selectedOrder[userId].orderNumber}`) });
        break;

      case 'p2pTradeSell_accept':
        bot.deleteMessage(userId, messageId);
        const SellOrderData = await OrderFilling.findOne({ orderNumber: selectedOrder[userId].orderNumber });
        await OrderFilling.updateOne(
          { orderNumber: selectedOrder[userId].orderNumber },
          { $set: { status: "Approve" } }
        );

        await freezeBalance(SellOrderData.client, SellOrderData.coinAmount, SellOrderData.coin);

        bot.sendMessage(SellOrderData.client, 'Заявка принята, ожидате зачисления денег на карту...');
        bot.sendMessage(SellOrderData.creatorOrder, `Сработал ордер №${SellOrderData.orderNumber}.
Сумма покупки ${SellOrderData.coinAmount} ${SellOrderData.coin} по курсу ${SellOrderData.rate} ${SellOrderData.currency}.
Переведите ${SellOrderData.currencyAmount} ${SellOrderData.currency} на <i><code>${SellOrderData.requisites}</code></i> и нажмите кнопку <b>«Done»</b> после перевода`, { replyMarkup: generateButton(buyerPayOrder, `buyerPayOrder_${SellOrderData.orderNumber}`), parseMode: 'html' });
        break;

      case 'p2pTradeSell_cancel':
        bot.deleteMessage(userId, messageId);
        await OrderFilling.deleteOne({ orderNumber: selectedOrder[userId].orderNumber });
        await CustomP2POrder.updateOne(
          { orderNumber: selectedOrder[userId].orderNumber },
          { $set: { status: "Selling" } }
        );

        bot.sendMessage(userId, 'Торговля отменена!', { replyMarkup: RM_Home })
        break;

      case 'liquidity_pools':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Выберите действие:', { replyMarkup: liquidityPoolsIK })
        break;

      case 'create_liquidityPools':
        bot.deleteMessage(userId, messageId);
        const allCoin = Object.keys((await BalanceUserModel.findOne({ id: userId })).main);
        firstPage.push('Page2');
        coinSellArray[userId] = Array.from(allCoin);
        bot.sendMessage(userId, 'Вы перешли в раздел создания пула ликвидности. Доход начисляется в монете <b>CASHBACK</b>. Выберите монету для продажи:', { replyMarkup: generateButton(firstPage, 'sellCoinPool'), parseMode: 'html' })
        break;

      case 'my_liquidityPools':
        bot.deleteMessage(userId, messageId);
        const allUserPool = await LiquidityPools.find({ id: userId });
        if (allUserPool.length === 0) return bot.sendMessage(userId, 'На данный момент у вас нету ни одного пула ликвидности.');

        for (let i = 0; i < allUserPool.length; i++) {
          const deletePoolIK = bot.inlineKeyboard([
            [bot.inlineButton('Удалить пул ❌', { callback: `deletePool_${allUserPool[i].token}` })]
          ]);
          bot.sendMessage(userId, `Пара: ${(allUserPool[i].sellCoin).toUpperCase()}/${(allUserPool[i].buyCoin).toUpperCase()},
Количество монет для пула: ${allUserPool[i].amount} ${(allUserPool[i].sellCoin).toUpperCase()}.`, { replyMarkup: deletePoolIK })
        }
        break;

      case 'profit_liquidityPools':
        bot.deleteMessage(userId, messageId);
        const balanceProfit = (await ProfitPoolModel.findOne({ id: userId })).profit;
        const cancelButt = bot.inlineKeyboard([
          [bot.inlineButton('Назад' , { callback: 'cancel' })],
        ]);
        bot.sendMessage(userId, `Введите сумму снятия прибыли из пулов ликвидности (доступно ${balanceProfit} CASHBACK): `, { replyMarkup: cancelButt });
        setState(userId, 15);
        break;

      case 'createPool_accept':
        bot.deleteMessage(userId, messageId);
        const createdToken = v4();

        await LiquidityPools.create({
          id: userId,
          token: createdToken,
          sellCoin: sellCoin[userId],
          buyCoin: buyCoin[userId],
          amount: amount[userId],
        });

        await freezeBalance(userId, amount[userId], sellCoin[userId]);
        bot.sendMessage(userId, 'Пул успешно создан ✔️');
        sendLog(`Пользователь ${userId} создал пул ликвидности ${sellCoin[userId].toUpperCase()}/${buyCoin[userId].toUpperCase()}`)
        break;

      case 'createPool_cancel':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Операция отменена ❌\nВы в главном меню.', { replyMarkup: RM_Home });
        break;

      case 'decimalExchange':
        bot.deleteMessage(userId, messageId);
        const arrayCoinList = Object.keys((await BalanceUserModel.findOne({ id: userId })).main);
        const decimalCoinList = arrayCoinList.filter((element) =>
          !(element === 'bip' ||
            element === 'hub' ||
            element === 'usdtbsc' ||
            element === 'bnb' ||
            element === 'monsterhub' ||
            element === 'usdt' ||
            element === 'artery' ||
            element === 'mine' ||
            element === 'plex' ||
            element === 'mpx' ||
            element === 'xfi')
        );

        const firstDecimalPage = decimalCoinList.slice(0, 20);
        firstDecimalPage.push('Page2');
        await bot.sendMessage(userId, 'Вы перейшли в раздел конвертациив сети <b>Decimal</b>.\nОплата комисии производится в монете <b>DEL</>', { parseMode: 'html' });
        await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(firstDecimalPage, 'sellDecimalExchange') });
        break;

      case 'minterExchange':
        bot.deleteMessage(userId, messageId);
        const arrayAllCoin = Object.keys((await BalanceUserModel.findOne({ id: userId })).main);
        const minterCoinList = arrayAllCoin.filter((element) =>
          element === 'bip' ||
          element === 'hub' ||
          element === 'usdtbsc' ||
          element === 'bnb' ||
          element === 'monsterhub'
        );
        coinSellArray[userId] = Array.from(minterCoinList);

        await bot.sendMessage(userId, 'Вы перейшли в раздел конвертации в сети <b>Minter</>.\n<b>Для обмена доступны только целые суммы!</b>. Оплата комисии производится в монете <b>BIP</b>.', { parseMode: 'html' });
        await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(minterCoinList, 'sellMinterExchange') });
        break;

      case 'minterExchange_accept':
        bot.deleteMessage(userId, messageId);
        const exchange = await exchangeMinterTransaction(exchangeRoute[userId], exchangeSellAmount[userId], config.adminMinterMnemonic);

        if (!exchange.status) return await bot.sendMessage(userId, `Возникла непредвиденная ошибка! Сообщите администрации.`, { parseMode: 'html' });

        await bot.sendMessage(userId, `Обмен произошел успешно!\nTxHash: <code>${exchange.data.hash}</code>`, { parseMode: 'html' });
        await ControlUserBalance(userId, sellCoin[userId], -exchangeSellAmount[userId]);
        await ControlUserBalance(userId, buyCoin[userId], exchangeBuyAmount[userId]);
        await ControlUserBalance(userId, 'bip', -comissionExchanger[userId]);

        await sendLog(`Пользователь ${userId} конвертировал монеты из сети Minter.\nTxHash: <code>${exchange.data.hash}</code>`)
        break;

      case 'minterExchange_cancel':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Операция отменена ❌\nВы в главном меню.', { replyMarkup: RM_Home });
        break;

      case 'withdrawPoolProfit_accept':
        bot.deleteMessage(userId, messageId);
        
        await poolProfitManagement(userId, -amount[userId]);
        await ControlUserBalance(userId, 'cashback', amount[userId]);

        await bot.sendMessage(userId, `Вы успешно вывели ${amount[userId]} CASHBACK из пулов ликвидности. Средства успешно начислены на ваш баланс.`);
        await sendLog(`Пользователь ${userId} вывел прибыль из пулов ликвидности в размере ${amount[userId]} CASHBACK.`)
        break;

      case 'withdrawPoolProfit_cancel':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Операция отменена ❌\nВы в главном меню.', { replyMarkup: RM_Home });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error)
  }
});

bot.on('callbackQuery', async (msg) => {
  try {
    const data = msg.data;
    const userId = msg.from.id;
    const messageId = msg.message.message_id;
    const arrayCoinList = Object.keys((await BalanceUserModel.findOne({ id: userId })).main);
    const decimalArrayCoinList = arrayCoinList.filter((element) =>
      !(element === 'bip' ||
        element === 'hub' ||
        element === 'usdtbsc' ||
        element === 'bnb' ||
        element === 'monsterhub' ||
        element === 'usdt' ||
        element === 'artery' ||
        element === 'mine' ||
        element === 'plex' ||
        element === 'mpx' ||
        element === 'xfi')
    );
    const getInfoUser = await UserManagement.getInfoUser(userId);

    if (data === 'sell_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету для продажи:', { replyMarkup: generateButton(list[userId], 'sell') });
    }
    else if (data === 'sell_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету для продажи:', { replyMarkup: generateButton(list[userId], 'sell') });
    }
    else if (data === 'sell_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету для продажи:', { replyMarkup: generateButton(list[userId], 'sell') });
    }
    else if (data === 'sell_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
      await bot.sendMessage(userId, 'Выберите монету для продажи:', { replyMarkup: generateButton(list[userId], 'sell') });
    }
    else if (data.split('_')[0] === 'sell') {
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      coinSellArray[userId] = Array.from(arrayCoinList);
      deleteSelectedCoin(sellCoin[userId], coinSellArray[userId]);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету для покупки:', { replyMarkup: generateButton(list[userId], 'buy') })
    }
    else if (data === 'buy_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету для покупки:', { replyMarkup: generateButton(list[userId], 'buy') })
    }
    else if (data === 'buy_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету для покупки:', { replyMarkup: generateButton(list[userId], 'buy') })
    }
    else if (data === 'buy_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету для покупки:', { replyMarkup: generateButton(list[userId], 'buy') })
    }
    else if (data === 'buy_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, coinSellArray[userId].length);
      list[userId].push('Page3');
      await bot.sendMessage(userId, 'Выберите монету для покупки:', { replyMarkup: generateButton(list[userId], 'buy') })
    }
    else if (data.split('_')[0] === 'buy') {
      setState(userId, 13);
      bot.deleteMessage(userId, messageId);
      buyCoin[userId] = data.split('_')[1];
      const rate = await getCoinRate(sellCoin[userId], buyCoin[userId]);
      rateExchange[userId] = circumcisionAmount(rate);
      await bot.sendMessage(userId, `Курс: 1 ${sellCoin[userId].toUpperCase()} ≈ <code>${rateExchange[userId]}</code> ${buyCoin[userId].toUpperCase()}. Комиссия сделки составляет 1% от суммы сделки, оплата осуществляется в монете CASHBACK.`, { parseMode: 'html' });
      await bot.sendMessage(userId, 'Введите курс по какому будет осуществлена торговля, курс должен быть в стиле <i>0.0001</i>:', { parseMode: "html" });
    }
    else if (data.split('_')[0] === 'createCounterOrder') {
      const selectedOrder = data.split('_')[1];
      const selectOrderData = await CustomOrder.findOne({ orderNumber: selectedOrder });

      if (selectOrderData.status === 'Done' || selectOrderData.status === 'Deleted') return bot.sendMessage(userId, 'Данного ордера больше не существует!');
      const rateCounterOrder = 1 / selectOrderData.rate;

      setState(userId, 29);
      userRate[userId] = rateCounterOrder;
      buyCoin[userId] = selectOrderData.sellCoin;
      sellCoin[userId] = selectOrderData.buyCoin;
      number[userId] = selectOrderData.buyAmount;
      balanceUserCoin[userId] = getInfoUser.userBalance.main[sellCoin[userId]];

      console.log('rateOrde: ', selectOrderData.rate);
      console.log('rateCounterOrde: ', rateCounterOrder);

      const textMessage = `Выбран ордер №${selectedOrder}!
Для продажи доступно: ${circumcisionAmount(balanceUserCoin[userId])} ${sellCoin[userId].toUpperCase()}.
Комиссия сделки составляет 1% от суммы сделки, оплата осуществляется в монете CASHBACK.
Введите сумму продажи ${sellCoin[userId]} (не больше: <code>${number[userId]}</code> ${sellCoin[userId]}): `;
      bot.sendMessage(userId, textMessage, { parseMode: 'html' });
    }
    else if (data.split('_')[0] === 'deleteOrder') {
      const numberDeleteOrder = data.split('_')[1];
      const deleteOrder = await CustomOrder.findOne(
        { id: userId, orderNumber: numberDeleteOrder }
      );
      if (deleteOrder.status === 'Deleted' || deleteOrder.status === 'Done') return bot.sendMessage(userId, `Простите, но ордера по №${numberDeleteOrder} не существует.`);

      await CustomOrder.updateOne(
        { id: userId, orderNumber: numberDeleteOrder },
        { $set: { status: 'Deleted' } }
      );

      await unfreezeBalance(userId, deleteOrder.sellAmount, deleteOrder.sellCoin);
      await unfreezeBalance(userId, deleteOrder.comission, 'cashback');

      await bot.sendMessage(userId, `Ордер №${numberDeleteOrder} был успешно удалён ✅`);
    }
    else if (data === 'replenishment_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push(`Page2`);;
      bot.sendMessage(userId, 'Выберите валюту пополнения:', { replyMarkup: generateButton(list[userId], 'replenishment') });
    }
    else if (data === 'replenishment_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push(`Page1`, `Page3`);
      await bot.sendMessage(userId, 'Выберите валюту пополнения: ', { replyMarkup: generateButton(list[userId], 'replenishment') });
    }
    else if (data === 'replenishment_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push(`Page2`, 'Page4');
      await bot.sendMessage(userId, 'Выберите валюту пополнения: ', { replyMarkup: generateButton(list[userId], 'replenishment') });
    }
    else if (data === 'replenishment_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push(`Page3`);
      await bot.sendMessage(userId, 'Выберите валюту пополнения: ', { replyMarkup: generateButton(list[userId], 'replenishment') });
    }

    else if (data.split('_')[0] === 'replenishment') {
      bot.deleteMessage(userId, messageId);
      const textReplenishment = [
        `Способ пополнения через <b>${data.split('_')[1].toUpperCase()}</b>`,
        'Деньги прийдут в течении 10 минут.',
        `<b>Минимальная сумма пополнения ${minimalSum[data.split('_')[1]]} ${data.split('_')[1].toUpperCase()}. В случает пополнения суммы меньшей минимальной деньги не будут зачислены на счет!</b>`,
        'Для пополнение баланса переведите средства на свой адрес ниже:'
      ].join('\n');
      await bot.sendMessage(userId, textReplenishment, { replyMarkup: RM_Home, parseMode: 'html' });

      // if (data.split('_')[1] === 'usdt') {
      //   return bot.sendMessage(userId, 'Пополнение USDT временно недоступно!');
      // }
      if (data.split('_')[1] === 'usdt') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.usdt.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      }
      else if (data.split('_')[1] === 'mine' || data.split('_')[1] === 'plex') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.minePlex.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      }
      else if (data.split('_')[1] === 'mpx' || data.split('_')[1] === 'xfi') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.mpxXfi.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      }
      else if (data.split('_')[1] === 'artery') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.artery.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      }
      else if (data.split('_')[1] === 'bip' || data.split('_')[1] === 'hub' || data.split('_')[1] === 'monsterhub' || data.split('_')[1] === 'bnb' || data.split('_')[1] === 'usdtbsc') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.minter.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      } else {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.del.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      };
    }

    else if (data === 'withdrawal_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      bot.sendMessage(userId, 'Выберите валюту вывода:', { replyMarkup: generateButton(list[userId], 'withdrawal') });
    }
    else if (data === 'withdrawal_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push(`Page1`, `Page3`);
      await bot.sendMessage(userId, 'Выберите валюту вывода: ', { replyMarkup: generateButton(list[userId], 'withdrawal') });
    }
    else if (data === 'withdrawal_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push(`Page2`, 'Page4');
      await bot.sendMessage(userId, 'Выберите валюту вывода: ', { replyMarkup: generateButton(list[userId], 'withdrawal') });
    }
    else if (data === 'withdrawal_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push(`Page3`);
      await bot.sendMessage(userId, 'Выберите валюту вывода: ', { replyMarkup: generateButton(list[userId], 'withdrawal') });
    }
    else if (data.split('_')[0] === 'withdrawal') {
      bot.deleteMessage(userId, messageId);
      let delCoin;
      (data.split('_')[1] === 'mine') ||
        (data.split('_')[1] === 'plex') ||
        (data.split('_')[1] === 'usdt') ||
        (data.split('_')[1] === 'mpx') ||
        (data.split('_')[1] === 'xfi') ||
        (data.split('_')[1] === 'artery') ||
        (data.split('_')[1] === 'bip') ||
        (data.split('_')[1] === 'monsterhub') ||
        (data.split('_')[1] === 'bnb') ||
        (data.split('_')[1] === 'usdtbsc') ||
        (data.split('_')[1] === 'hub') ?
        delCoin = false : delCoin = true;

      if (data.split('_')[1] === 'mine' || data.split('_')[1] === 'plex') {
        coin[userId] = data.split('_')[1];
        balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
        minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
        bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия вывода составляет 2 MINE! Доступно: ${balanceUserCoin[userId]} ${coin[userId].toUpperCase()}.\nВведите сумму вывода:`, { replyMarkup: RM_Home });
        setState(userId, 27);
      };
      if (data.split('_')[1] === 'usdt') {
        try {
          coin[userId] = data.split('_')[1];
          balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
          minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
          await bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}. Доступно: ${balanceUserCoin[userId]} ${coin[userId].toUpperCase()}.\nКомиссия вывода составляет 2 USDT!\nВведите сумму вывода:`, { replyMarkup: RM_Home });
          setState(userId, 27);
        } catch (error) {
          console.error(error);
          bot.sendMessage(userId, 'Возникла ошибка');
        }
      }
      else if (data.split('_')[1] === 'mpx' || data.split('_')[1] === 'xfi') {
        try {
          coin[userId] = data.split('_')[1];
          balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
          minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
          await bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nДоступно: ${balanceUserCoin[userId]} ${coin[userId].toUpperCase()}. Комиссия вывода составляет 2 MPX!\nВведите сумму вывода:`, { replyMarkup: RM_Home });
          setState(userId, 27);
        } catch (error) {
          console.error(error);
          bot.sendMessage(userId, 'Возникла ошибка');
        }
      }
      else if (data.split('_')[1] === 'artery') {
        try {
          coin[userId] = data.split('_')[1];
          balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
          minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
          await bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия оплачивается за счёт пользователя!\nДоступно: ${balanceUserCoin[userId]} ${coin[userId].toUpperCase()}. Введите сумму вывода:`, { replyMarkup: RM_Home });
          setState(userId, 27);
        } catch (error) {
          console.error(error);
          bot.sendMessage(userId, 'Возникла ошибка');
        }
      }
      else if (data.split('_')[1] === 'bip' || data.split('_')[1] === 'hub' || data.split('_')[1] === 'monsterhub' || data.split('_')[1] === 'bnb' || data.split('_')[1] === 'usdtbsc') {
        try {
          coin[userId] = data.split('_')[1];
          balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
          minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
          await bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nДоступно: ${balanceUserCoin[userId]} ${coin[userId].toUpperCase()}. Комиссия составляет 70 BIP!\nВведите сумму вывода:`, { replyMarkup: RM_Home });
          setState(userId, 27);
        } catch (error) {
          console.error(error);
          bot.sendMessage(userId, 'Возникла ошибка');
        }
      }

      if (delCoin) {
        coin[userId] = data.split('_')[1];
        balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
        minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
        bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия оплачивается за счёт пользователя!\nДоступно: ${balanceUserCoin[userId]} ${coin[userId].toUpperCase()}. Введите сумму вывода:`, { replyMarkup: RM_Home });
        setState(userId, 10);
      }
    }
    else if (data === 'sellDecimalExchange_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, decimalArrayCoinList, 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellDecimalExchange') });
    }
    else if (data === 'sellDecimalExchange_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, decimalArrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellDecimalExchange') });
    }
    else if (data === 'sellDecimalExchange_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, decimalArrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'sellDecimalExchange') });
    }
    else if (data === 'sellDecimalExchange_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, decimalArrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'sellDecimalExchange') });
    }
    else if (data.split('_')[0] === 'sellDecimalExchange') {
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      coinSellArray[userId] = Array.from(arrayCoinList);
      coinSellArray[userId] = coinSellArray[userId].filter((element) =>
        !(element === 'bip' ||
          element === 'hub' ||
          element === 'usdtbsc' ||
          element === 'bnb' ||
          element === 'monsterhub' ||
          element === 'usdt' ||
          element === 'artery' ||
          element === 'mine' ||
          element === 'plex' ||
          element === 'mpx' ||
          element === 'xfi')
      );
      deleteSelectedCoin(sellCoin[userId], coinSellArray[userId]);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2')
      balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyDecimalExchange') });
    }
    else if (data === 'buyDecimalExchange_Page1') {
      bot.deleteMessage(userId, messageId);
      coinSellArray[userId] = coinSellArray[userId].filter((element) =>
        !(element === 'bip' ||
          element === 'hub' ||
          element === 'usdtbsc' ||
          element === 'bnb' ||
          element === 'monsterhub' ||
          element === 'usdt' ||
          element === 'artery' ||
          element === 'mine' ||
          element === 'plex' ||
          element === 'mpx' ||
          element === 'xfi')
      );
      console.log(coinSellArray[userId].length);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyDecimalExchange') });
    }
    else if (data === 'buyDecimalExchange_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyDecimalExchange') });
    }
    else if (data === 'buyDecimalExchange_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyDecimalExchange') });
    }
    else if (data === 'buyDecimalExchange_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, arrayCoinList.length);
      list[userId].push('Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyDecimalExchange') });
    }
    else if (data.split('_')[0] === 'buyDecimalExchange') {
      try {
        setState(userId, 12)
        bot.deleteMessage(userId, messageId);
        buyCoin[userId] = data.split('_')[1];
        rateExchange[userId] = await ExchangeRateCoin.ExchangeRate(sellCoin[userId], buyCoin[userId]);
        await bot.sendMessage(userId, `Курс пары обмена 1 ${sellCoin[userId].toUpperCase()} = ${rateExchange[userId].toFixed(4)} ${buyCoin[userId].toUpperCase()}\nДоступно для обмена: ${balanceUserCoin[userId]}`);
        await bot.sendMessage(userId, 'Введите количество продажи монет:');
      } catch (error) {
        console.error(error);
      }
    }
    else if (data === 'buyP2P_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P') });
    }
    else if (data === 'buyP2P_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P') });
    }
    else if (data === 'buyP2P_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P') });
    }
    else if (data === 'buyP2P_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P') });
    }
    else if (data.split('_')[0] === 'buyP2P') {
      bot.deleteMessage(userId, messageId);
      coin[userId] = data.split('_')[1];
      await bot.sendMessage(userId, 'Выбирете валюту совершения сделки:', { replyMarkup: generateButton(currency, 'сurrencyP2P') });
    }
    else if (data === 'сurrencyP2P_UAH') {
      bot.deleteMessage(userId, messageId);
      currencyP2P[userId] = data.split('_')[1];
      bot.sendMessage(userId, 'Выбирете способ облаты:', { replyMarkup: generateButton(paymentSystemUA, 'paymentSystem') });
    }
    else if (data === 'сurrencyP2P_RUB') {
      bot.deleteMessage(userId, messageId);
      currencyP2P[userId] = data.split('_')[1];
      bot.sendMessage(userId, 'Выбирете способ облаты:', { replyMarkup: generateButton(paymentSystemRU, 'paymentSystem') });
    }
    else if (data === 'сurrencyP2P_TRY') {
      bot.deleteMessage(userId, messageId);
      currencyP2P[userId] = data.split('_')[1];
      bot.sendMessage(userId, 'Выбирете способ облаты:', { replyMarkup: generateButton(paymentSystemTUR, 'paymentSystem') });
    }
    else if (data.split('_')[0] === 'paymentSystem') {
      paymentSystem[userId] = data.split('_')[1];
      bot.deleteMessage(userId, messageId);
      if (orderType[userId] === 'buy') {
        setState(userId, 19);
        await bot.sendMessage(userId, 'Введите количество покупки монеты:');
      } else {
        setState(userId, 18);
        await bot.sendMessage(userId, 'Введите реквизиты на которые желаете получить деньги:');
      }
    }
    else if (data === 'sellP2P_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P') });
    }
    else if (data === 'sellP2P_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P') });
    }
    else if (data === 'sellP2P_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P') });
    }
    else if (data === 'sellP2P_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P') });
    }
    else if (data.split('_')[0] === 'sellP2P') {
      bot.deleteMessage(userId, messageId);
      coin[userId] = data.split('_')[1];
      await bot.sendMessage(userId, 'Выбирете валюту совершения сделки:', { replyMarkup: generateButton(currency, 'сurrencyP2P') });
    }
    else if (data.split('_')[0] === 'buyerPayOrder') {
      bot.deleteMessage(userId, messageId);
      const OrderData = await OrderFilling.findOne({ orderNumber: data.split('_')[1] });
      await OrderFilling.updateOne(
        { orderNumber: data.split('_')[1] },
        { $set: { status: 'Accept' } }
      );

      await bot.sendMessage(OrderData.creatorOrder, 'Вы оплатили ордер, ожидайте перевод монет на аккаунт 2 стороной');
      await bot.sendMessage(
        OrderData.client,
        `Покупатель оплатил ордер! Переведите монеты на его счет.`,
        { replyMarkup: generateButton(payOrderCoin, `p2pSendCoin_${OrderData.orderNumber}`) }
      );
    }
    else if (data.split('_')[0] === 'p2pSendCoin') {
      const orderData = await OrderFilling.findOne({ orderNumber: data.split('_')[1] });
      const platformOrderData = await CustomP2POrder.findOne({ orderNumber: data.split('_')[1] });

      if (orderType[userId] === 'sell') {
        await BalanceUserModel.updateOne(
          { id: orderData.client },
          JSON.parse(`{"$inc": { "hold.${orderData.coin}": -${orderData.coinAmount} } }`)
        );

        await BalanceUserModel.updateOne(
          { id: orderData.creatorOrder },
          JSON.parse(`{"$inc": { "main.${orderData.coin}": ${orderData.coinAmount} } }`)
        );

        if (orderData.coinAmount === platformOrderData.amount) {
          await CustomP2POrder.updateOne(
            { orderNumber: orderData.orderNumber },
            { $set: { status: 'Done' } }
          );
        }
        else if (orderData.coinAmount < platformOrderData.amount) {
          await CustomP2POrder.updateOne(
            { orderNumber: orderData.orderNumber },
            { $set: { status: 'Selling' } }
          );

          await CustomP2POrder.updateOne(
            { orderNumber: orderData.orderNumber },
            JSON.parse(`{"$inc": { "amount": -${orderData.coinAmount} } }`)
          );

          sum[userId] = Number(platformOrderData.amount) - Number(orderData.coinAmount);

          if (platformOrderData.minAmount > sum[userId]) {
            await CustomP2POrder.updateOne(
              { orderNumber: orderData.orderNumber },
              JSON.parse(`{ "minAmount": ${sum[userId]} }`)
            );
          };
        };

        await OrderFilling.deleteOne(
          { orderNumber: orderData.orderNumber }
        );

        console.log('creatorOrder: ', orderData);


        console.log('creatorOrder: ', orderData.creatorOrder);

        await bot.sendMessage(orderData.creatorOrder, `Ордер выполнен успешно, ${orderData.coinAmount} ${orderData.coin} будут зачислены на ваш аккаунт ✅`);
        await bot.deleteMessage(orderData.client, messageId);
        await bot.sendMessage(orderData.client, 'Ордер выполнен успешно ✅');
        await sendLog(`Пользователь ${orderData.creatorOrder} успешно купил у пользователя ${orderData.client} ${orderData.coinAmount} ${orderData.coin}`);
      } else {
        await BalanceUserModel.updateOne(
          { id: orderData.client },
          JSON.parse(`{"$inc": { "main.${orderData.coin}": ${orderData.coinAmount} } }`)
        );
        await BalanceUserModel.updateOne(
          { id: orderData.creatorOrder },
          JSON.parse(`{"$inc": { "hold.${orderData.coin}": -${orderData.coinAmount} } }`)
        );

        if (orderData.coinAmount === platformOrderData.amount) {
          await CustomP2POrder.updateOne(
            { orderNumber: orderData.orderNumber },
            { $set: { status: 'Done' } }
          );
        }
        else if (orderData.coinAmount < platformOrderData.amount) {
          await CustomP2POrder.updateOne(
            { orderNumber: orderData.orderNumber },
            { $set: { status: 'Selling' } }
          );

          await CustomP2POrder.updateOne(
            { orderNumber: orderData.orderNumber },
            JSON.parse(`{"$inc": { "amount": -${orderData.coinAmount} } }`)
          );

          sum[userId] = Number(platformOrderData.amount) - Number(orderData.coinAmount);

          if (platformOrderData.minAmount > sum[userId]) {
            await CustomP2POrder.updateOne(
              { orderNumber: orderData.orderNumber },
              JSON.parse(`{ "minAmount": ${sum[userId]} }`)
            );
          };
        };

        await OrderFilling.deleteOne(
          { orderNumber: orderData.orderNumber }
        );
        await bot.sendMessage(orderData.client, `Ордер выполнен успешно, ${orderData.coinAmount} ${orderData.coin} будут зачислены на ваш аккаунт ✅`);
        await bot.deleteMessage(orderData.creatorOrder, messageId);
        await bot.sendMessage(orderData.creatorOrder, 'Ордер выполнен успешно ✅');
        await sendLog(`Пользователь ${orderData.client} успешно купил у пользователя ${orderData.creatorOrder} ${orderData.coinAmount} ${orderData.coin}`);
      };
    }
    else if (data.split('_')[0] === 'deleteP2P') {
      const numberDelOrder = data.split('_')[1];
      const selectDelOrderData = await CustomP2POrder.findOne({ id: userId, orderNumber: numberDelOrder });

      if (selectDelOrderData.status === 'Deleted' || selectDelOrderData.status === 'Done' || selectDelOrderData.status === 'Filling') return bot.sendMessage(userId, `Простите, но ордера по №${numberDelOrder} не существует.`);

      if (selectDelOrderData.type === 'buy') {
        await CustomP2POrder.updateOne(
          { id: userId, orderNumber: numberDelOrder },
          { $set: { status: 'Deleted' } }
        );
        await bot.sendMessage(userId, `Ордер №${numberDelOrder} был успешно удалён.`);
        await sendLog(`Пользователь ${userId} удалил Р2Р ордер №${numberDelOrder}`);
      } else {
        await CustomP2POrder.updateOne(
          { id: userId, orderNumber: numberDelOrder },
          { $set: { status: 'Deleted' } }
        );
        await unfreezeBalance(userId, selectDelOrderData.amount, selectDelOrderData.coin);

        await bot.sendMessage(userId, `Ордер №${numberDelOrder} был успешно удалён, средства возвращенны на ваш баланс`);
        await sendLog(`Пользователь ${userId} удалил Р2Р ордер №${numberDelOrder}`);
      }
    }
    else if (data.split('_')[0] === 'p2pTrade') {
      const orderNumber = data.split('_')[1];
      selectedOrder[userId] = await CustomP2POrder.findOne({ orderNumber: orderNumber });
      coin[userId] = selectedOrder[userId].coin;
      if (selectedOrder[userId].status !== 'Selling') return bot.sendMessage(userId, `Простите, но ордер №${orderNumber} нуже не доступен.`);

      await CustomP2POrder.updateOne(
        { orderNumber: orderNumber },
        { $set: { status: 'Filling' } }
      );

      if (orderType[userId] === 'sell') {
        setState(userId, 23);
        bot.sendMessage(userId, `Выбран ордер №${orderNumber}. Введите реквизиты на которые желаете получить деньги:`);
      } else {
        setState(userId, 25);
        await bot.sendMessage(selectedOrder[userId].id, `Сработал ордер №${orderNumber}, покупатель в скором времени совершит оплату.`);
        await bot.sendMessage(userId, `Выбран ордер №${orderNumber}. Лимит ордера: ${selectedOrder[userId].minAmount} - ${selectedOrder[userId].amount} ${selectedOrder[userId].coin.toUpperCase()}.\nВведите количество покупки монеты:`);
      }
    }
    else if (data === 'sellCoinPool_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellCoinPool') });
    }
    else if (data === 'sellCoinPool_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellCoinPool') });
    }
    else if (data === 'sellCoinPool_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellCoinPool') });
    }
    else if (data === 'sellCoinPool_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, arrayCoinList.length);
      list[userId].push('Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellCoinPool') });
    }
    else if (data.split('_')[0] === 'sellCoinPool') {
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      coinSellArray[userId] = Array.from(arrayCoinList);
      deleteSelectedCoin(sellCoin[userId], coinSellArray[userId]);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyCoinPool') })
    }
    else if (data === 'buyCoinPool_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'buyCoinPool') });
    }
    else if (data === 'buyCoinPool_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'buyCoinPool') });
    }
    else if (data === 'buyCoinPool_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'buyCoinPool') });
    }
    else if (data === 'buyCoinPool_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, arrayCoinList.length);
      list[userId].push('Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'buyCoinPool') });
    }
    else if (data.split('_')[0] === 'buyCoinPool') {
      bot.deleteMessage(userId, messageId);
      buyCoin[userId] = data.split('_')[1];
      await bot.sendMessage(userId, 'Введите количество монет для добавления в пул ликвидности: ');
      setState(userId, 26);
    }
    else if (data.split('_')[0] === 'deletePool') {
      const poolToken = data.split('_')[1];
      const selectedPool = await LiquidityPools.findOne({ token: poolToken });

      if (selectedPool === null) return bot.sendMessage(userId, 'Данного пула больше не существует!');

      await LiquidityPools.deleteOne({ token: poolToken });
      await unfreezeBalance(userId, selectedPool.amount, selectedPool.sellCoin);
      bot.sendMessage(userId, `Пул с парой ${selectedPool.sellCoin}/${selectedPool.buyCoin} был успешно удалён!\nДеньги будут возвращены на баланс.`);
      sendLog(`Пользователь ${userId} удалил пул ликвидности.`)
    }
    else if (data.split('_')[0] === 'sellMinterExchange') {
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      deleteSelectedCoin(sellCoin[userId], coinSellArray[userId]);
      balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(coinSellArray[userId], 'buyMinterExchange') });
    }
    else if (data.split('_')[0] === 'buyMinterExchange') {
      bot.deleteMessage(userId, messageId);
      buyCoin[userId] = data.split('_')[1];
      const rate = await getCoinRate(sellCoin[userId], buyCoin[userId]);
      rateExchange[userId] = circumcisionAmount(rate);
      const balanceSellCoin = await getBalanceCoin(userId, sellCoin[userId]);
      bot.sendMessage(userId, `Курс 1 ${sellCoin[userId].toUpperCase()} = ${rateExchange[userId]} ${buyCoin[userId]}. Введите количество продажи ${sellCoin[userId].toUpperCase()} (доступно ${balanceSellCoin}):`);
      setState(userId, 17);
    }

  } catch (error) {
    console.error(error);
  }
});

let sum = [];
let list = []; // страница с кнопками
let coin = [];
let number = [];
let amount = [];
let wallet = [];
let requisites = [];
let currencyP2P = []; //валюта сделки
let buyCoin = [];  // монета покупки
let sellCoin = [];  // монета продажи
let userRate = []; // курс торговли пользователя
let exchangeRoute = []; // доступное количество покупки согласно заданому курсу и балансу пользователя
let orderType = []; // тип ордера
let orderNumber = [];
let paymentSystem = [];
let exchangeBuyAmount = [];  // количество получаемой монеты
let rateExchange = [];  // курс обмена
let coinSellArray = []; // массив с кнопками без продаваемой монеты
let selectedOrder = []; //выбранный ордер
let exchangeSellAmount = [];  // количество продаваемых монет
let balanceUserCoin = [];  // баланс пользователя
let comissionExchanger = [];  // комиссия обмена
let minimalWithdrawAmount = []; // минимальная сумма вывода

bot.start();
// bot.stop();

