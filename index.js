const axios = require('axios');
const TeleBot = require('telebot');
const mongoose = require('mongoose');
const config = require('./config.js');
const CoinGecko = require('coingecko-api');

const { 
  RM_Home,
  typeOrder,
  orderMenu,
  cabinetIK,
  sellExchangeIK,
  balancePage2IK,
  balancePage3IK,
  balancePage4IK,
  settingsOrderIK,
  balanceStartPageIK,
  acceptCancelOrderIK,
  acceptCancelExchangeIK,
  acceptCancelWithdrawalIK,
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
const checkUserTransaction = require('./cron/ReplenishmentStatusCheck.js');
const UserModel = require('./model/modelUser.js');
const checkUserExchangeTransaction = require('./cron/StatusCheckExchanger.js');
const updateCoinBalance = require('./cron/UpdateCoinBalance.js');
const ExchangeRateCoin = require('./exchanger/exchangeRate.js');
const ExchangeCoinTransaction = require('./exchanger/exchangeTransaction.js');
const ExchangeStatus = require('./model/modelExchangeStatus.js');
const splitOrders = require('./cron/OrderCheck.js');
const checkOrders = require('./cron/OrderCheck.js');

mongoose.connect('mongodb://127.0.0.1/test');

const bot = new TeleBot (config.token);
const CoinGeckoClient = new CoinGecko();

async function setState(id, status) { UserModel.findOneAndUpdate({ id: id }, { status: status }).then((e) => { }); };

function handleButtonSelection(selectedButtonId, arrayElement) {
  const selectedIndex = arrayElement.findIndex(button => button === selectedButtonId);
  if (selectedIndex !== -1) {
    arrayElement.splice(selectedIndex, 1);
  }
};

function generateButton(arrayElement, nameCallback) {
  const IK = [];
  arrayElement.map((e, i) => {
      if (i % 2 === 0) {
          IK.push([bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` })]);
      } else {
          IK[Math.floor(i / 2)].push(bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` }));
      }
  });
  return bot.inlineKeyboard(IK);
};

async function ControlUserBalance (id, coin, amount) {
  await BalanceUserModel.updateOne({id: id}, JSON.parse(`{"$inc": { "main.${coin}": ${amount}} }`));
};

async function pageNavigationButton(id, array, startEl, finishEl) {
  const arr = array.slice(startEl, finishEl)
  list[id] = Array.from(arr);
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

};

//text
bot.on('text', async (msg) => {
  try {
    const userId = msg.from.id;
    const text = msg.text;
    const userName = msg.from.first_name;
    const getInfoUser = await UserManagement.getInfoUser(userId);

    switch (text) {
      case '/start':
        setState(userId, 0);
        await AuthenticationService.Authentication(userId);
        bot.sendMessage(userId, `${userName}, добро пожаловать!`, {replyMarkup: RM_Home});
        break;

      case 'Мой кабинет 📂':
        const quantytyCoin = (Object.keys((await BalanceUserModel.findOne({id: userId})).main)).length;
        await bot.sendMessage(userId, 'Вы перейшли в свой кабинет!')
        .then(() => bot.sendMessage(userId, `👤 Имя: ${userName}\n🆔 ID: ${userId}\n🏦 Статус:...\n💲 Количество монет в боте: ${quantytyCoin}`, {replyMarkup: cabinetIK}));
        break;

      case 'Ордера 📒':
        bot.sendMessage(userId, 'Выбирете раздел:', { replyMarkup: orderMenu});
        break;
      
      case 'Настройка торговли ⚙️':
        bot.sendMessage(userId, 'Раздел в разработке');
        break;

      case 'Рефералы 👥':
        bot.sendMessage(userId, 'Раздел в разработке');
        break;
      
      case 'Конвертация 🔄':
        const arrayCoinList = Object.keys((await BalanceUserModel.findOne({id: userId})).main);
        const firstPage = arrayCoinList.slice(0, 20);
        firstPage.push('Page2');
        await bot.sendMessage(userId, 'Вы перейшли в раздел конвертации\nОплата комисии производится в монете DEL');
        await bot.sendMessage(userId,'Выберите монету которую хотите продать:', { replyMarkup: generateButton(firstPage, 'sellExchange') });
        break;

      default:
        break;
    }

  //states
  if(getInfoUser === "not user") return;
    switch (getInfoUser.user.status) {
      case 10:
        setState(userId, 11);
        amount[userId] = Number(text);

        if (isNaN(amount[userId])) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Введено не коректное число!');
        }

        const comission = (await TransferCommission(decimalMnemonics, decimalWallet, coin[userId], amount[userId])).data.result.result.amount/1e18;
        sum[userId] = amount[userId] + (comission * 2);

        if (amount[userId] < minimalWithdrawAmount[userId]) {
          setState(userId, 0);
          return bot.sendMessage(userId, 'Вы ввели сумму вывода ниже минимальной!', {replyMarkup: RM_Home});
        };

        if (sum[userId] > balanceUserCoin[userId]) {
          setState(userId, 0);
          return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода с комиссией составляет ${sum[userId]} ${coin[userId].toUpperCase()}`, { replyMarkup: RM_Home});
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
          exchangeAmount[userId] = Number(text);

          if (isNaN(exchangeAmount[userId])) {
            setState(userId, 0)
            return bot.sendMessage(userId, 'Введено не коректное число!', { replyMarkup: RM_Home });
          }

          if (balanceUserCoin[userId] < exchangeAmount[userId]) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'На вашем балансе не достаточно средств для обмена!', { replyMarkup: RM_Home });
          };

          sumExchanger[userId] = (rateExchange[userId] * exchangeAmount[userId]) + 0.0001;

          const result = (await ExchangeCoinTransaction.exchangeComission(
            decimalMnemonics,
            sellCoin[userId],
            buyCoin[userId],
            sumExchanger[userId],
            exchangeAmount[userId]
            )).data.result.result.amount/1e18;
            comissionExchanger[userId] = result;
          const textExchange = [
            `Курс: 1 ${sellCoin[userId].toUpperCase()} = ${(rateExchange[userId] + 0.0001).toFixed(4)} ${buyCoin[userId].toUpperCase()}`,
            `Количество продаваемой монеты: ${(exchangeAmount[userId]).toFixed(4)} ${sellCoin[userId].toUpperCase()}`,
            `Количество покупаемой монеты: ${sumExchanger[userId].toFixed(4)} ${buyCoin[userId].toUpperCase()}`,
            `Комиссия составляет ${comissionExchanger[userId]} DEL`
          ].join('\n');
          await bot.sendMessage(userId, textExchange, { replyMarkup: acceptCancelExchangeIK });
          break;

        case 13:
          setState(userId, 14);
          userRate[userId] = Number(text);
          if (isNaN(userRate[userId])) {
            await setState(userId, 0);
            return bot.sendMessage(userId, 'Введенно не коректное число!\nВведите курс по которому будет осуществлена торговля в стиле: <i>0.0001</i>', { parseMode: "html"});
          }
          balanceUserCoin[userId] = getInfoUser.userBalance.main[sellCoin[userId]];
          bot.sendMessage(userId, `Доступно ${balanceUserCoin[userId]} ${sellCoin[userId].toUpperCase()} \nВведите количество продаваемых монет:`);
          break;

        case 14:
          setState(userId, 0);
          amount[userId] = Number(text);
          if (isNaN(amount[userId])) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Введено не коректное число!', { replyMarkup: RM_Home });
          }

          if (amount[userId] > balanceUserCoin[userId]) {
            setState(userId, 0);
            return await bot.sendMessage(userId, 'На вашем балансе не достаточно средств!', { replyMarkup: RM_Home });
          }

          sum[userId] = amount[userId] * userRate[userId];
          orderNumber[userId] = (await CustomOrder.countDocuments()) + 1;
          bot.sendMessage(userId, `Ордер № ${orderNumber[userId]},
Тип ордера: ${orderType[userId]},
Продаваемая монета: ${sellCoin[userId]},
Покупаемая монета: ${buyCoin[userId]},
Курс продажи: ${userRate[userId]} ${buyCoin[userId]},
Количество продажи: ${amount[userId]} ${sellCoin[userId].toUpperCase()},
Количество покупки: ${sum[userId]} ${buyCoin[userId].toUpperCase()}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'operationSell')});
          break;

        case 15:
          setState(userId, 16);
          userRate[userId] = Number(text);
          if (isNaN(userRate[userId])) {
            await setState(userId, 0);
            return bot.sendMessage(userId, 'Введенно не коректное число!\nВведите курс по которому будет осуществлена торговля в стиле: <i>0.0001</i>', { parseMode: "html"});
          }
          balanceUserCoin[userId] = getInfoUser.userBalance.main[sellCoin[userId]];
          digitsBuy[userId] = balanceUserCoin[userId] / userRate[userId];
          bot.sendMessage(userId, `Согласно введеному курсу доступно для покупки, доступно ${digitsBuy[userId]} ${buyCoin[userId]}\nВведите количество покупки монет:`);
          break;

        case 16:
          setState(userId, 0);
          amount[userId] = Number(text);
          if (isNaN(amount[userId])) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Введено не коректное число!', { replyMarkup: RM_Home });
          }

          if (amount[userId] > digitsBuy[userId]) {
            setState(userId, 0);
            return await bot.sendMessage(userId, 'На вашем балансе не достаточно средств!\nВведите меньшую сумму или курс покупки монеты!', { replyMarkup: RM_Home });
          }

          sum[userId] = amount[userId] * userRate[userId];
          orderNumber[userId] = (await CustomOrder.countDocuments()) + 1;
          bot.sendMessage(userId, `Ордер № ${orderNumber[userId]},
Тип ордера: ${orderType[userId]},
Продаваемая монета: ${sellCoin[userId]},
Покупаемая монета: ${buyCoin[userId]},
Курс покупки: ${userRate[userId]} ${buyCoin[userId]},
Количество покупки: ${amount[userId]} ${buyCoin[userId].toUpperCase()},
Количество продажи: ${sum[userId]} ${sellCoin[userId].toUpperCase()}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'operationBuy')});
          break;

        case 17:
          setState(userId, 0);
          number[userId] = Number(text);
          selectedOrder[userId] = await CustomOrder.findOne({
            id: userId, orderNumber: number[userId]
          });
          if (!selectedOrder[userId]) return bot.sendMessage(userId, 'Ордера с таким номером не найденно 😞');
    
          if (selectedOrder[userId].status === 'Done' && selectedOrder[userId].processed) return bot.sendMessage(userId, `Ордер №${selectedOrder[userId].orderNumber} уже выполнен ✅`);

          await CustomOrder.updateOne(
            {id: userId, orderNumber: number[userId]},
            {$set: {status: 'Deleted', processed: true}}
          );
          await bot.sendMessage(userId, `Ордер №${selectedOrder[userId].orderNumber} был успешно удалён ✅`);
          break;

      default:
        break;
    };

    } catch (error){
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
    const arrayCoinList = Object.keys((await BalanceUserModel.findOne({id: userId})).main);
    const firstPage = arrayCoinList.slice(0, 20);

    const textBalance = [
      '💵 Балансы:',
      `DEL: ${(getInfoUser.userBalance.main.del).toFixed(4)}`,
      `BAZERCOIN: ${(getInfoUser.userBalance.main.bazercoin).toFixed(4)}`,
      `BAZERUSD: ${(getInfoUser.userBalance.main.bazerusd).toFixed(4)}`,
      `PRO: ${(getInfoUser.userBalance.main.pro).toFixed(4)}`,
      `DAR: ${(getInfoUser.userBalance.main.dar).toFixed(4)}`,
      `SBT: ${(getInfoUser.userBalance.main.sbt).toFixed(4)}`,
      `REBOOT: ${(getInfoUser.userBalance.main.reboot).toFixed(4)}`,
      `MAKAROVSKY: ${(getInfoUser.userBalance.main.makarovsky).toFixed(4)}`,
      `BTT: ${(getInfoUser.userBalance.main.btt).toFixed(4)}`,
      `DIXWELL: ${(getInfoUser.userBalance.main.dixwell).toFixed(4)}`,
      `AVT: ${(getInfoUser.userBalance.main.avt).toFixed(4)}`,
      `KHARAT: ${(getInfoUser.userBalance.main.kharat).toFixed(4)}`,
      `BYACADEMY: ${(getInfoUser.userBalance.main.byacademy).toFixed(4)}`,
      `PATRICK: ${(getInfoUser.userBalance.main.patrick).toFixed(4)}`,
      `ITCOIN: ${(getInfoUser.userBalance.main.itcoin).toFixed(4)}`,
      `MESSEGE: ${(getInfoUser.userBalance.main.messege).toFixed(4)}`,
      `RRUNION: ${(getInfoUser.userBalance.main.rrunion).toFixed(4)}`,
      `VEGVISIR: ${(getInfoUser.userBalance.main.vegvisir).toFixed(4)}`,
      `FBWORLD: ${(getInfoUser.userBalance.main.fbworld).toFixed(4)}`,
      `DCSCHOOL: ${(getInfoUser.userBalance.main.dcschool).toFixed(4)}`,
      `COMCOIN: ${(getInfoUser.userBalance.main.comcoin).toFixed(4)}`,
      `MINTCANDY: ${(getInfoUser.userBalance.main.mintcandy).toFixed(4)}`,
      `SIRIUS: ${(getInfoUser.userBalance.main.sirius).toFixed(4)}`,
      `CGTTOKEN: ${(getInfoUser.userBalance.main.cgttoken).toFixed(4)}`,
      `GENESIS: ${(getInfoUser.userBalance.main.genesis).toFixed(4)}`,
      `TAXICOIN: ${(getInfoUser.userBalance.main.taxicoin).toFixed(4)}`,
      `PROSMM: ${(getInfoUser.userBalance.main.prosmm).toFixed(4)}`,
      `SHARAFI: ${(getInfoUser.userBalance.main.sharafi).toFixed(4)}`,
      `SAFECOIN: ${(getInfoUser.userBalance.main.safecoin).toFixed(4)}`,
      `DTRADECOIN: ${(getInfoUser.userBalance.main.dtradecoin).toFixed(4)}`,
      `IZICOIN: ${(getInfoUser.userBalance.main.izicoin).toFixed(4)}`,
      `GZACADEMY: ${(getInfoUser.userBalance.main.gzacademy).toFixed(4)}`,
      `WORKOUT: ${(getInfoUser.userBalance.main.workout).toFixed(4)}`,
      `ZARUBA: ${(getInfoUser.userBalance.main.zaruba).toFixed(4)}`,
      `MAGNETAR: ${(getInfoUser.userBalance.main.magnetar).toFixed(4)}`,
      `CANDYPOP: ${(getInfoUser.userBalance.main.candypop).toFixed(4)}`,
      `RANDOMX: ${(getInfoUser.userBalance.main.randomx).toFixed(4)}`,
      `EKOLOGY: ${(getInfoUser.userBalance.main.ekology).toFixed(4)}`,
      `EMELYANOV: ${(getInfoUser.userBalance.main.emelyanov).toFixed(4)}`,
      `BELYMAG: ${(getInfoUser.userBalance.main.belymag).toFixed(4)}`,
      `DOORHAN: ${(getInfoUser.userBalance.main.doorhan).toFixed(4)}`,
      `LAKSHMI: ${(getInfoUser.userBalance.main.lakshmi).toFixed(4)}`,
      `RYABININ: ${(getInfoUser.userBalance.main.ryabinin).toFixed(4)}`,
      `RELATED: ${(getInfoUser.userBalance.main.related).toFixed(4)}`,
      `MONOPOLY: ${(getInfoUser.userBalance.main.monopoly).toFixed(4)}`,
      `BARONCOIN: ${(getInfoUser.userBalance.main.baroncoin).toFixed(4)}`,
      `NASHIDELA: ${(getInfoUser.userBalance.main.nashidela).toFixed(4)}`,
      `IRMACOIN: ${(getInfoUser.userBalance.main.irmacoin).toFixed(4)}`,
      `MARITIME: ${(getInfoUser.userBalance.main.maritime).toFixed(4)}`,
      `BUSINESS: ${(getInfoUser.userBalance.main.business).toFixed(4)}`,
      `RANDICE: ${(getInfoUser.userBalance.main.randice).toFixed(4)}`,
      `ALLELUIA: ${(getInfoUser.userBalance.main.alleluia).toFixed(4)}`,
      `HOSANNA: ${(getInfoUser.userBalance.main.hosanna).toFixed(4)}`,
      `CBGREWARDS: ${(getInfoUser.userBalance.main.cbgrewards).toFixed(4)}`,
      `NOVOSELKA: ${(getInfoUser.userBalance.main.novoselka).toFixed(4)}`,
      `MONKEYCLUB: ${(getInfoUser.userBalance.main.monkeyclub).toFixed(4)}`,
      `GRANDPAY: ${(getInfoUser.userBalance.main.grandpay).toFixed(4)}`,
      `MAGNATE: ${(getInfoUser.userBalance.main.magnate).toFixed(4)}`,
      `CRYPTON: ${(getInfoUser.userBalance.main.crypton).toFixed(4)}`,
      `ILOVEYOU: ${(getInfoUser.userBalance.main.iloveyou).toFixed(4)}`,


    ];

    switch(data) {
      case 'balance':
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, textBalance, 0, 20);
      await bot.sendMessage(userId, list[userId].join('\n'), { replyMarkup: balanceStartPageIK });
      break;

      case 'balance_page2':
        bot.deleteMessage(userId, messageId);
        await pageNavigationButton(userId, textBalance, 20, 40);
        bot.sendMessage(userId, list[userId].join('\n'), { replyMarkup: balancePage2IK });
        break;

      case 'balance_page3':
        bot.deleteMessage(userId, messageId);
        await pageNavigationButton(userId, textBalance, 40, 60);
        await bot.sendMessage(userId, list[userId].join('\n'), { replyMarkup: balancePage3IK });
        break;

      case 'balance_page4':
        bot.deleteMessage(userId, messageId);
        await pageNavigationButton(userId, textBalance, 60, textBalance.length);
        await bot.sendMessage(userId, list[userId].join('\n'), { replyMarkup: balancePage4IK });
        break;

      case 'user_replenishment':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2');
        bot.sendMessage(userId, 'Выберите валюту пополнения:', {replyMarkup: generateButton(firstPage, 'replenishment')});
        break;
  
      case 'user_withdrawal':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2');
        bot.sendMessage(userId,'Выберите валюту вывода:', {replyMarkup: generateButton(firstPage, 'withdrawal')});
        break;
  
      case 'main_menu':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', {replyMarkup: RM_Home});
        break;

      case 'accept_withdrawal':
        try {
          bot.deleteMessage(userId, messageId);
          const sendCoinUser = await SendCoin(decimalMnemonics, wallet[userId], coin[userId], amount[userId]);
          if (sendCoinUser.data.result.result.tx_response.code != 0) return bot.sendMessage(userId, 'При выводе возникла ошибка', { replyMarkup: RM_Home});
          await ControlUserBalance(userId, coin[userId], -sum[userId]);
          await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendCoinUser.data.result.result.tx_response.txhash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html'});
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

          if (comissionExchanger[userId] > getInfoUser.userBalance.main.del) {
            return bot.sendMessage(userId, 'На вашем балансе не достаточно средств для оплаты комисси!', { replyMarkup: RM_Home });
          }

          const exchangeTransaction = (await ExchangeCoinTransaction.exchangeTransaction(
          decimalMnemonics,
          sellCoin[userId],
          buyCoin[userId],
          sumExchanger[userId],
          exchangeAmount[userId]
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

      case 'created_orders':
        bot.deleteMessage(userId, messageId);
        const userOrder = await CustomOrder.find({id: userId});
        if (userOrder.length === 0) return bot.sendMessage(userId, 'Вы еще не создавали ни 1 ордера 😞');
        let messageUserOrder = '';

        for (let i = 0; i < userOrder.length; i++) {
          let rateCoin = '';
          if (userOrder[i].status === 'Done' || userOrder[i].status === 'Deleted' && userOrder[i].processed) continue
          if (userOrder[i].type === 'sell') {
            rateCoin = userOrder[i].sellCoin;
          } else {
            rateCoin = userOrder[i].buyCoin;
          };

          messageUserOrder += `Ордер №${userOrder[i].orderNumber},
Тип ордера: ${userOrder[i].type},
Статус: ${userOrder[i].status},
Продаваемая монета: ${userOrder[i].sellCoin},
Покупаемая монета: ${userOrder[i].buyCoin},
Сумма покупки: ${userOrder[i].buyAmount} ${userOrder[i].buyCoin},
Сумма продажи: ${userOrder[i].sellAmount} ${userOrder[i].sellCoin},
Курс осуществления операции: ${userOrder[i].rate} ${rateCoin.toUpperCase()}.\n\n`
        };
        bot.sendMessage(userId, messageUserOrder, { replyMarkup:  settingsOrderIK });
        break;

      case 'delete_order':
        setState(userId, 17);
        bot.sendMessage(userId, 'Введите номер ордера который желаете удалить:');
        break;

      case 'list_order':
        bot.deleteMessage(userId, messageId);
        const listOrder = await CustomOrder.find({});
        let messageAllOrder = '';

        for (let i = 0; i < listOrder.length; i++) {
          let rateCoin = '';
          if (listOrder[i].status === 'Done' || listOrder[i].status === 'Deleted' && listOrder[i].processed) continue
          if (listOrder[i].type === 'sell') {
            rateCoin = listOrder[i].sellCoin;
          } else {
            rateCoin = listOrder[i].buyCoin;
          };

          messageAllOrder +=`Ордер №${listOrder[i].orderNumber},
Тип ордера: ${listOrder[i].type},
Статус: ${listOrder[i].status},
Продаваемая монета: ${listOrder[i].sellCoin},
Покупаемая монета: ${listOrder[i].buyCoin},
Сумма покупки: ${listOrder[i].buyAmount} ${listOrder[i].buyCoin},
Сумма продажи: ${listOrder[i].sellAmount} ${listOrder[i].sellCoin},
Курс осуществления операции: ${listOrder[i].rate} ${rateCoin.toUpperCase()}.\n\n`
        }
        bot.sendMessage(userId, messageAllOrder);
        break;

      case 'new_order':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Выберите тип ордера:', { replyMarkup: typeOrder });
        break;

      case 'operation_sell':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2')
        orderType[userId] = 'sell';
        await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(firstPage, 'sell')});
        break;

      case 'operation_buy':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2')
        orderType[userId] = 'buy';
        await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(firstPage, 'operaionBuy')});
        break;

      case 'operationSell_accept':
        bot.deleteMessage(userId, messageId);
        CustomOrder.create({
          id: userId,
          orderNumber: orderNumber[userId],
          type: orderType[userId],
          status: 'Selling',
          processed: false,
          sellCoin: sellCoin[userId],
          buyCoin: buyCoin[userId],
          sellAmount: amount[userId],
          buyAmount: sum[userId],
          rate: userRate[userId]
        })
        bot.sendMessage(userId, 'Ордер успешно создан ✅', { replyMarkup: RM_Home });
        break;

      case 'operationSell_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'operationBuy_accept':
        bot.deleteMessage(userId, messageId);
        CustomOrder.create({
          id: userId,
          orderNumber: orderNumber[userId],
          type: orderType[userId],
          status: 'Selling',
          processed: false,
          sellCoin: sellCoin[userId],
          buyCoin: buyCoin[userId],
          sellAmount: sum[userId],
          buyAmount: amount[userId],
          rate: userRate[userId]
        })
        bot.sendMessage(userId, 'Ордер успешно создан ✅', { replyMarkup: RM_Home });
        break;

      case 'operationBuy_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home });
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
    const messageId =  msg.message.message_id;
    const arrayCoinList = Object.keys((await BalanceUserModel.findOne({id: userId})).main);
    const getInfoUser = await UserManagement.getInfoUser(userId);

  if (data === 'sell_Page1') {
    bot.deleteMessage(userId, messageId);
    await pageNavigationButton(userId, arrayCoinList, 0, 20);
    list[userId].push('Page2');
    await bot.sendMessage(userId, 'Выберите продаваемую монету:', { replyMarkup: generateButton(list[userId], 'sell')});
  }
    else if (data === 'sell_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите продаваемую монету:', { replyMarkup: generateButton(list[userId], 'sell')});
    }
    else if (data === 'sell_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, arrayCoinList.length);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите продаваемую монету:', { replyMarkup: generateButton(list[userId], 'sell')});
    }
    else if(data.split('_')[0] === 'sell') {
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      coinSellArray[userId] = Array.from(arrayCoinList);
      handleButtonSelection(sellCoin[userId], coinSellArray[userId]);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'buy')})
    }
    else if(data === 'buy_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'buy')})
    }
    else if(data === 'buy_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'buy')})
    }
    else if(data === 'buy_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, coinSellArray[userId].length);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'buy')})
    }
    else if(data.split('_')[0] === 'buy') {
      setState(userId, 13);
      bot.deleteMessage(userId, messageId);
      buyCoin[userId] = data.split('_')[1];
      rateExchange[userId] = (await ExchangeRateCoin.ExchangeRate(sellCoin[userId], buyCoin[userId]));
      await bot.sendMessage(userId, `Курс: 1 ${sellCoin[userId].toUpperCase()} = ${rateExchange[userId]} ${buyCoin[userId].toUpperCase()}`);
      await bot.sendMessage(userId, 'Введите курс по какому будет осуществлена торговля, курс должен быть в стиле <i>0.0001</i>:', { parseMode: "html" });
    }

    else if(data === 'replenishment_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push(`Page2`);;
      bot.sendMessage(userId, 'Выберите валюту пополнения:', {replyMarkup: generateButton(list[userId], 'replenishment')});
    }

    else if(data === 'replenishment_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push(`Page1`, `Page3`);
      await bot.sendMessage(userId,'Выберите валюту пополнения: ', {replyMarkup: generateButton(list[userId], 'replenishment')});
    }

    else if(data === 'replenishment_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, arrayCoinList.length);
      list[userId].push(`Page2`);
      await bot.sendMessage(userId,'Выберите валюту пополнения: ', {replyMarkup: generateButton(list[userId], 'replenishment')});
    }

    else if(data.split('_')[0] === 'replenishment') {
      bot.deleteMessage(userId, messageId);
      const textReplenishment = [
        `Способ пополнения через <b>${data.split('_')[1].toUpperCase()}</b>`,
        'Деньги прийдут в течении 10 минут.',
        `Минимальная сумма пополнения ${minimalSum[data.split('_')[1]]} ${data.split('_')[1].toUpperCase()}.`,
        'Для пополнение баланса переведите средства на свой адрес ниже:'
      ].join('\n');
      await bot.sendMessage(userId, textReplenishment, { replyMarkup: RM_Home, parseMode: 'html' });
      await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.del.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
    }
    else if(data === 'withdrawal_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      bot.sendMessage(userId, 'Выберите валюту вывода:', {replyMarkup: generateButton(list[userId], 'withdrawal')});
    }
    else if(data === 'withdrawal_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push(`Page1`, `Page3`);
      await bot.sendMessage(userId,'Выберите валюту вывода: ', {replyMarkup: generateButton(list[userId], 'withdrawal')});
    }
    else if(data === 'withdrawal_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, arrayCoinList.length);
      list[userId].push(`Page2`);
      await bot.sendMessage(userId,'Выберите валюту вывода: ', {replyMarkup: generateButton(list[userId], 'withdrawal')});
    }
    else if(data.split('_')[0] === 'withdrawal'){
      bot.deleteMessage(userId, messageId);
      coin[userId] = data.split('_')[1];
      balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
      minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
      bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия оплачивается за счёт пользователя!\nВведите сумму вывода:`, {replyMarkup: RM_Home});
      setState(userId, 10);
    }
    else if(data === 'sellExchange_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellExchange') });
    }
    else if(data === 'sellExchange_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellExchange') });
    }
    else if (data === 'sellExchange_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, arrayCoinList.length);
      list[userId].push('Page2');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'sellExchange') });
    }
    else if (data.split('_')[0] === 'sellExchange') {
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      coinSellArray[userId] = Array.from(arrayCoinList);
      handleButtonSelection(sellCoin[userId], coinSellArray[userId]);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2')
      balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:' , { replyMarkup: generateButton(list[userId], 'buyExchange') });
    }
    else if(data === 'buyExchange_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyExchange') });
    }
    else if (data === 'buyExchange_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyExchange') });
    }
    else if(data === 'buyExchange_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, arrayCoinList.length);
      list[userId].push('Page2');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyExchange') });
    }
    else if(data.split('_')[0] === 'buyExchange') {
      try {
        setState(userId, 12)
        bot.deleteMessage(userId, messageId);
        buyCoin[userId] = data.split('_')[1];
        rateExchange[userId] = (await ExchangeRateCoin.ExchangeRate(sellCoin[userId], buyCoin[userId])) - 0.001;
        await bot.sendMessage(userId, `Курс пары обмена 1 ${sellCoin[userId].toUpperCase()} = ${rateExchange[userId].toFixed(4)} ${buyCoin[userId].toUpperCase()}\nДоступно для обмена: ${balanceUserCoin[userId]}`);
        await bot.sendMessage(userId, 'Введите количество продажи монет:');
      } catch (error) {
        console.error(error);
      }
    }
    else if (data === 'operaionBuy_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'operaionBuy')});
    }
    else if (data === 'operaionBuy_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'operaionBuy')});
    }
    else if (data === 'operaionBuy_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, arrayCoinList.length);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'operaionBuy')});
    }
    else if (data.split('_')[0] === 'operaionBuy') {
      bot.deleteMessage(userId, messageId);
      buyCoin[userId] = data.split('_')[1];
      coinSellArray[userId] = Array.from(arrayCoinList);
      handleButtonSelection(buyCoin[userId], coinSellArray[userId]);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'operaionSell')});
    }
    else if (data === 'operaionSell_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'operaionSell')});
    }
    else if (data === 'operaionSell_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'operaionSell')});
    }
    else if (data === 'operaionSell_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 40, coinSellArray[userId].length);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'operaionSell')});
    }
    else if (data.split('_')[0] === 'operaionSell') {
      setState(userId, 15);
      bot.deleteMessage(userId, messageId);
      sellCoin[userId] = data.split('_')[1];
      rateExchange[userId] = (await ExchangeRateCoin.ExchangeRate(buyCoin[userId], sellCoin[userId]));
      await bot.sendMessage(userId, `Курс: 1 ${buyCoin[userId].toUpperCase()} = ${rateExchange[userId]} ${sellCoin[userId].toUpperCase()}`);
      await bot.sendMessage(userId, 'Введите курс по какому будет осуществлена покупка, курс должен быть в стиле <i>0.0001</i>:', { parseMode: "html" });
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
let buyCoin = [];  // монета покупки
let sellCoin = [];  // монета продажи
let userRate = []; // курс торговли пользователя
let digitsBuy = []; // доступное количество покупки согласно заданому курсу и балансу пользователя
let orderType = []; // тип ордера
let orderNumber = [];
let sumExchanger = [];  // количество получаемой монеты
let rateExchange = [];  // курс обмена
let coinSellArray = []; // массив с кнопками без продаваемой монеты
let selectedOrder = []; //выбранный ордер
let exchangeAmount = [];  // количество продаваемых монет
let balanceUserCoin = [];  // баланс пользователя
let comissionExchanger = [];  // комиссия обмена
let minimalWithdrawAmount = []; // минимальная сумма вывода

bot.start();
checkUserTransaction.start();
checkUserExchangeTransaction.start();
// updateCoinBalance.start();
checkOrders.start();