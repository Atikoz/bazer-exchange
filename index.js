const axios = require('axios');
const TeleBot = require('telebot');
const mongoose = require('mongoose');
const config = require('./config.js');
const CoinGecko = require('coingecko-api');
const WalletUserModel = require('./model/modelWallet.js');
const CreateUsdtWallet = require('./function/createUsdtWallet.js');
const CreateMinePlexWallet = require('./function/createMinePlexWallet.js');


const { 
  RM_Home,
  payOrder,
  currency,
  p2pMenuIK,
  cabinetIK,
  payOrderCoin,
  typeP2POrder,
  buyerPayOrder,
  backP2PmenuIK,
  spotOrderMenu,
  typeSpotOrder,
  balancePage2IK,
  balancePage3IK,
  balancePage4IK,
  paymentSystemUA,
  paymentSystemRU,
  settingsOrderIK,
  paymentSystemTUR,
  createdOrderMenu,
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
const CustomP2POrder = require('./model/modelP2POrder.js');
const checkUserTransaction = require('./cron/ReplenishmentStatusCheck.js');
const UserModel = require('./model/modelUser.js');
const checkUserExchangeTransaction = require('./cron/StatusCheckExchanger.js');
const updateCoinBalance = require('./cron/UpdateCoinBalance.js');
const ExchangeRateCoin = require('./exchanger/exchangeRate.js');
const ExchangeCoinTransaction = require('./exchanger/exchangeTransaction.js');
const ExchangeStatus = require('./model/modelExchangeStatus.js');
const checkOrders = require('./cron/OrderCheck.js');
const OrderFilling = require('./model/modelOrderFilling.js');
const createUsdtWallet = require('./function/createUsdtWallet.js');
const { TransferTronNet } = require('./function/usdtTransactions.js');

const {
  checkUserUsdtTransaction,
  chechAdminUsdtTransaction
} = require('./cron/ReplenishmentUsdtCheck.js');
const { checkUserMinePlexTransaction, chechAdminMinePlexTransaction, checkHashSendAdminComission } = require('./cron/ReplenishmentMineCheck.js');
const { sendCoin } = require('./function/minePlexTransactions.js');

mongoose.connect('mongodb://127.0.0.1/test');

const bot = new TeleBot (config.token);

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
  usdt: 1,
  mine: 10,
  plex: 10,
  ddao: 5
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
        const quantytyCoin = /*(Object.keys((await BalanceUserModel.findOne({id: userId})).main)).length;*/ 61;
        await bot.sendMessage(userId, 'Вы перейшли в свой кабинет!')
        .then(() => bot.sendMessage(userId, `👤 Имя: ${userName}\n🆔 ID: ${userId}\n🏦 Статус:...\n💲 Количество монет в боте: ${quantytyCoin}`, {replyMarkup: cabinetIK}));
        break;

      case 'Ордера 📒':
        bot.sendMessage(userId, 'Выбирете раздел:', { replyMarkup: spotOrderMenu});
        break;
      
      case 'P2P':
        bot.sendMessage(userId, 'Вы перешли в раздел Р2Р', {replyMarkup: p2pMenuIK});
        break;

      case 'Рефералы 👥':
        bot.sendMessage(userId, 'Раздел в разработке');

        async function startTe() {
          const createUsdt = await CreateUsdtWallet();
          const users = await WalletUserModel.find({});
          users.map(async (u) => {
            console.log(u.del.mnemonics);
            await WalletUserModel.updateOne({ id: u.id}, { $set: { mnemonics: u.del.mnemonics } });

            await WalletUserModel.updateOne(
              {id: u.id},
              { $unset: {  "del.mnemonics": ""  }},
            );
            const createMinePlex = await CreateMinePlexWallet(u.mnemonics);

            await WalletUserModel.updateMany(
              { id: u.id }, 
              JSON.parse(`{ "$set" : { "minePlex.address": "${createMinePlex.data.keys.pkh}", "minePlex.sk": "${createMinePlex.data.keys.sk}", "minePlex.pk": "${createMinePlex.data.keys.pk}", "usdt.address": "${createUsdt.address}", "usdt.privateKey": "${createUsdt.privateKey}" } }`)
            );

            await BalanceUserModel.updateOne(
              { id: u.id}, 
              JSON.parse(`{ "$inc" : { "main.usdt": "0", "main.mine": "0", "main.plex": "0", "main.ddao": "0", "hold.usdt": "0", "hold.mine": "0", "hold.plex": "0", "hold.ddao": "0"} }`)
            );
          });
          console.log(await WalletUserModel.find({}));
        };

        startTe();
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
            )).data.result.result.amount/1e18;
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
            id: userId, orderNumber: number[userId], typeOrder: 'spotSelling'
          });
          if (!selectedOrder[userId]) return bot.sendMessage(userId, 'Ордера с таким номером не найденно 😞');
    
          if (selectedOrder[userId].status === 'Done' && selectedOrder[userId].processed) return bot.sendMessage(userId, `Ордер №${selectedOrder[userId].orderNumber} уже выполнен ✅`);

          await CustomOrder.updateOne(
            {id: userId, orderNumber: number[userId]},
            {$set: {status: 'Deleted', processed: true}}
          );
          await bot.sendMessage(userId, `Ордер №${selectedOrder[userId].orderNumber} был успешно удалён ✅`);
          break;

        case 18:
        setState(userId, 19);
        requisites[userId] = Number(text);
        await bot.sendMessage(userId, 'Введите количество продажи монеты:');
        break;

        case 19:
          setState(userId, 20);
          amount[userId] = Number(text);
          if (isNaN(text)) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Введено не коректное число');
          };

           if (orderType[userId] === 'buy') {
            
            bot.sendMessage(userId, 'Введите минимальную сумму закупки монеты:');
           } else {

            if (text > getInfoUser.userBalance.main[coin[userId]] ) {
              setState(userId, 0);
              return bot.sendMessage(userId, 'На вашем балансе не достаточно средств.');
            };

            bot.sendMessage(userId, 'Введите минимальную сумму продажи монеты:');
           }
          break;

        case 20:
          setState(userId, 21);
          if (isNaN(text)) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Введено не коректное число');
          };
          sum[userId] = Number(text);
          if (orderType[userId] === 'buy') {
            bot.sendMessage(userId, 'Введите курс закупки монет, курс должен быть в стиле <i>0.0001</i>:', { parseMode: "html" });
          } else {
            bot.sendMessage(userId, 'Введите курс продажи монет, курс должен быть в стиле <i>0.0001</i>:', { parseMode: "html" });
          }
          break;

        case 21:
          setState(userId, 0);

          if (isNaN(text)) {return bot.sendMessage(userId, 'Введено не коректное число!')};

          userRate[userId] = Number(text);
          orderNumber[userId] = (await CustomP2POrder.countDocuments()) + 1;
          if (orderType[userId] === 'buy') {
            bot.sendMessage(userId, `Ордер № ${orderNumber[userId]},
Тип ордера: ${orderType[userId]},
Покупаемая монета: ${coin[userId]},
Количество покупки: ${amount[userId]} ${coin[userId].toUpperCase()},
Минимальная сумма закупки монеты: ${sum[userId]} ${coin[userId].toUpperCase()},
Валюта совершения сделки: ${currencyP2P[userId]},
Способ облаты: ${paymentSystem[userId]},
Курс покупки: ${userRate[userId]} ${currencyP2P[userId]}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'p2p') });
          } else {
            bot.sendMessage(userId, `Ордер № ${orderNumber[userId]},
Тип ордера: ${orderType[userId]},
Продаваемая монета: ${coin[userId]},
Количество продажи: ${amount[userId]} ${coin[userId].toUpperCase()},
Минимальная сумма продажи монеты: ${sum[userId]} ${coin[userId].toUpperCase()},
Валюта совершения сделки: ${currencyP2P[userId]},
Способ облаты: ${paymentSystem[userId]},
Курс продажи: ${userRate[userId]} ${currencyP2P[userId]}
Реквизиты: ${requisites[userId]}`, { replyMarkup: generateButton(acceptCancelOrderIK, 'p2p') });
          }
          break;

        case 22:
          if (isNaN(text)) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Введено не корректное число!', { replyMarkup: p2pMenuIK });
          };

          const numberOrder = Number(text);
          selectedOrder[userId] = await CustomP2POrder.findOne({
            orderNumber: numberOrder
          });

          if (!selectedOrder[userId]) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'По данному запросу не найденно ни 1 ордера!', { replyMarkup: p2pMenuIK });
          };

          if (Number(selectedOrder[userId].id) === userId) {
            setState(userId, 0);
            return bot.sendMessage(userId, 'Нельзя выбрать свой ордер!', { replyMarkup: p2pMenuIK });
          };

          if (orderType[userId] === 'buy' && selectedOrder[userId].type === 'buy' || orderType[userId] === 'sell' && selectedOrder[userId].type === 'sell') {
            setState(userId, 0);
            return bot.sendMessage(userId, `Ошибка вы указали номер ордера которыйт является типом ${selectedOrder[userId].type.toUpperCase()}\nПробуйте ввести другой номер...`, { replyMarkup: p2pMenuIK });
          };

          await CustomP2POrder.updateOne(
            {orderNumber: numberOrder},
            {$set: {status: 'Filling'}}
          );

          if(orderType[userId] === 'sell') {
            setState(userId, 23);
            bot.sendMessage(userId, 'Введите реквизиты на которые желаете получить деньги:');
          } else {
            setState(userId, 25);
            await bot.sendMessage(selectedOrder[userId].id, `Сработал ордер №${selectedOrder[userId].orderNumber}, покупатель в скором времени совершит оплату.`);
            await bot.sendMessage(userId, `Лимит ордера: ${selectedOrder[userId].minAmount} - ${selectedOrder[userId].amount} ${selectedOrder[userId].coin.toUpperCase()}.\nВведите количество покупки монеты:`);
          }
          break;

        case 23:
          setState(userId, 24);

          if (isNaN(text)) {
            setState(userId, 0);
            await OrderFilling.deleteOne(
              {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
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
            {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
            );
            return bot.sendMessage(userId, 'Введенно не коректное число!');
          };

          if (text > getInfoUser.userBalance.main[coin[userId]]) {
            return bot.sendMessage(userId, 'На вашем балансе не достаточно средств!');
          }

          if (text < selectedOrder[userId].minAmount) {
            await OrderFilling.deleteOne(
              {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
            );
            return bot.sendMessage(userId, 'Введенно количество меньше минимального!');
          };

          if (text > selectedOrder[userId].amount) {
            await OrderFilling.deleteOne(
              {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
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
            {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
            );
            return bot.sendMessage(userId, 'Введенно не коректное число!');
          };

          if (text < selectedOrder[userId].minAmount) {
            await OrderFilling.deleteOne(
              {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
            );
            return bot.sendMessage(userId, 'Введенно количество меньше минимального!');
          };

          if (text > selectedOrder[userId].amount) {
            await OrderFilling.deleteOne(
              {orderNumber: selectedOrder[userId].orderNumber}
            );
            await CustomP2POrder.updateOne(
              {orderNumber: selectedOrder[userId].orderNumber},
              {$set: {status: 'Selling'}}
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
        
        case 26:
          setState(userId, 0);
          if (isNaN(text)) {
            return bot.sendMessage(userId, 'Введено не коректное число!');
          };
          selectedOrder[userId] = Number(text);

          const userP2POrder = await CustomP2POrder.findOne({id: userId, orderNumber: selectedOrder[userId], status: 'Selling' });

          if (!userP2POrder) {
            return bot.sendMessage(userId, 'Не найденно ни 1 ордера с таким номером')
          };
          
          if (userP2POrder.type === 'buy') {
            await CustomP2POrder.deleteOne({id: userId, orderNumber: selectedOrder[userId]});
            await bot.sendMessage(userId, `Ордер №${userP2POrder.orderNumber} был успешно удалён.`);
          } else {
            await CustomP2POrder.deleteOne({id: userId, orderNumber: selectedOrder[userId]});
            await BalanceUserModel.updateOne(
              {id: userId},
              JSON.parse(`{"$inc": { "hold.${userP2POrder.coin}": -${userP2POrder.amount} } }`)
              );
            await BalanceUserModel.updateOne(
              {id: userId},
              JSON.parse(`{"$inc": { "main.${userP2POrder.coin}": ${userP2POrder.amount} } }`)
              );
            await bot.sendMessage(userId, `Ордер №${userP2POrder.orderNumber} был успешно удалён, средства возвращенны на ваш баланс`);
          }
          break;

        case 27:
          try {
            amount[userId] = Number(text);

            if (isNaN(amount[userId])) {
              setState(userId, 0);
              return bot.sendMessage(userId, 'Введено не коректное число!');
            }

            if (amount[userId] < minimalWithdrawAmount[userId]) {
              setState(userId, 0);
              return bot.sendMessage(userId, 'Вы ввели сумму вывода ниже минимальной!', {replyMarkup: RM_Home});
            };
            
            if ((coin[userId] === 'plex' && amount[userId] > balanceUserCoin[userId] && getInfoUser.userBalance.main.mine < 2) || (coin[userId] === 'mine' && (amount[userId] + 2) > balanceUserCoin[userId])) {
              setState(userId, 0);
              return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} ${coin[userId].toUpperCase()} + 2 MINE з уплату комиссии`, { replyMarkup: RM_Home});
            };
            if (coin[userId] === 'usdt' && (amount[userId] + 2) > balanceUserCoin[userId] ) {
              setState(userId, 0);
              return bot.sendMessage(userId, `На вашем балансе не достаточно средств для вывода!\nСумма вывода составляет ${amount[userId]} ${coin[userId].toUpperCase()} + 2 USDT з уплату комиссии`, { replyMarkup: RM_Home});
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
            if (coin[userId] === 'mine' || coin[userId] === 'plex') {
              await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${(amount[userId] + 2)} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK });
            }
            else if(coin[userId] === 'usdt') {
              await bot.sendMessage(userId, `Сумма вывода вместе с комиссией: ${(amount[userId] + 2)} ${coin[userId].toUpperCase()}\nАдресс кошелька: ${wallet[userId]}`, { replyMarkup: acceptCancelWithdrawalIK });
            }
          } catch (error) {
            console.error(error)
          }
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
      `USDT: ${(getInfoUser.userBalance.main.usdt).toFixed(4)}`,
      `MINE: ${(getInfoUser.userBalance.main.mine).toFixed(4)}`,
      `PLEX: ${(getInfoUser.userBalance.main.plex).toFixed(4)}`,
      `DEL: ${(getInfoUser.userBalance.main.del).toFixed(4)}`,
      `DDAO: ${(getInfoUser.userBalance.main.ddao).toFixed(4)}`,
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
          if (coin[userId] === 'mine' || coin[userId] === 'plex') {
            bot.deleteMessage(userId, messageId);
            const sendMinePlex = await sendCoin(config.adminMinePlexSk, wallet[userId], amount[userId], coin[userId]);
            if (sendMinePlex.data.error) return bot.sendMessage(userId, 'При выводе возникла ошибка', { replyMarkup: RM_Home});
            
            coin[userId] === 'mine' ? await ControlUserBalance(userId, coin[userId], -(amount[userId] + 2)) : 
              (await ControlUserBalance(userId, coin[userId], -amount[userId]), await ControlUserBalance(userId, 'mine', 2))

            await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendMinePlex.data.transaction.hash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html'});
          }
          if (coin[userId] === 'usdt') {
            bot.deleteMessage(userId, messageId);
            const sendUsdtHash = await TransferTronNet(config.adminPrivateKeyUsdt, config.contractUsdt, wallet[userId], amount[userId]);
            await ControlUserBalance(userId, coin[userId], -(amount[userId] + 2));
            await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendUsdtHash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html'});

          } else {
            bot.deleteMessage(userId, messageId);
            const sendCoinUser = await SendCoin(decimalMnemonics, wallet[userId], coin[userId], amount[userId]);
            if (sendCoinUser.data.result.result.tx_response.code != 0) return bot.sendMessage(userId, 'При выводе возникла ошибка', { replyMarkup: RM_Home});
            await ControlUserBalance(userId, coin[userId], -sum[userId]);
            await bot.sendMessage(userId, `Вывод успешный ✅\nTxHash: <code>${sendCoinUser.data.result.result.tx_response.txhash}</code>\nОжидайте, средства прийдут в течении нескольких минут.`, { parseMode: 'html'});
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

      case 'list_SpotOrders':
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

      case 'new_SpotOrders':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Выберите тип ордера:', { replyMarkup: typeSpotOrder });
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
          typeOrder: 'spotSelling',
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
          typeOrder: 'spotSelling',
          type: orderType[userId],
          status: 'Selling',
          processed: false,
          sellCoin: sellCoin[userId],
          buyCoin: buyCoin[userId],
          sellAmount: sum[userId],
          buyAmount: amount[userId],
          rate: userRate[userId]
        })
        await bot.sendMessage(userId, 'Ордер успешно создан ✅', { replyMarkup: RM_Home });
        break;

      case 'operationBuy_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'p2p_back':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы перешли в раздел Р2Р:', {replyMarkup: p2pMenuIK});
        break;

      case 'deleteP2P':
        setState(userId, 26);
        bot.sendMessage(userId, 'Введите номер ордера который желаете удалить:');
      break;
      
      case 'new_p2pOrders':
        bot.deleteMessage(userId,messageId);
        bot.sendMessage(userId, 'Выберите тип ордера:', { replyMarkup: typeP2POrder });
        break;

      case 'created_p2pOrders':
        bot.deleteMessage(userId, messageId);
        const userP2POrder = await CustomP2POrder.find({id: userId});
        if (userP2POrder.length === 0) return bot.sendMessage(userId, 'Вы еще не создавали ни 1 ордера 😞');
        let messageP2PUserOrder = '';

        for (let i = 0; i < userP2POrder.length; i++) {
          if (userP2POrder[i].status === 'Done' || userP2POrder[i].status === 'Deleted' && userP2POrder[i].processed) continue

          messageP2PUserOrder += `Ордер №${userP2POrder[i].orderNumber},
Тип ордера: ${userP2POrder[i].type},
Статус: ${userP2POrder[i].status},
Покупаемая монета: ${userP2POrder[i].coin},
Количество покупки: ${userP2POrder[i].amount} ${userP2POrder[i].coin},
Минимальная сумма закупки монеты: ${userP2POrder[i].minAmount} ${userP2POrder[i].coin},
Валюта совершения сделки: ${userP2POrder[i].currency},
Способ оплаты: ${userP2POrder[i].paymentSystem},
Курс покупки: ${userP2POrder[i].rate} ${userP2POrder[i].currency.toUpperCase()}.\n\n`
        };
        await bot.sendMessage(userId, messageP2PUserOrder, { replyMarkup: createdOrderMenu });
        break;

      case 'buyList_p2pOrders':
        setState(userId, 22);
        orderType[userId] = 'buy';
        bot.deleteMessage(userId, messageId);
        const buyAllP2POrder = await CustomP2POrder.find({type: 'sell'});
        if (buyAllP2POrder.length === 0) return bot.sendMessage(userId, 'На данный момент на площадке нету ни 1 ордера такого типа 😞');

        let messageP2PBuyAllOrder = '';

        for (let i = 0; i < buyAllP2POrder.length; i++) {
          if (buyAllP2POrder[i].status === 'Done' || buyAllP2POrder[i].status === 'Filling' || buyAllP2POrder[i].status === 'Deleted' && buyAllP2POrder[i].processed) continue
          if(Number(buyAllP2POrder[i].id) === userId) {

          messageP2PBuyAllOrder += `Ордер №${buyAllP2POrder[i].orderNumber} (you),
Покупаемая монета: ${buyAllP2POrder[i].coin},
Количество покупки: ${buyAllP2POrder[i].amount} ${buyAllP2POrder[i].coin},
Минимальная сумма закупки монеты: ${buyAllP2POrder[i].minAmount} ${buyAllP2POrder[i].coin},
Валюта совершения сделки: ${buyAllP2POrder[i].currency},
Способ оплаты: ${buyAllP2POrder[i].paymentSystem},
Курс покупки: ${buyAllP2POrder[i].rate} ${buyAllP2POrder[i].currency.toUpperCase()}.\n\n`
          } else {
            messageP2PBuyAllOrder += `Ордер №${buyAllP2POrder[i].orderNumber},
Покупаемая монета: ${buyAllP2POrder[i].coin},
Количество покупки: ${buyAllP2POrder[i].amount} ${buyAllP2POrder[i].coin},
Минимальная сумма закупки монеты: ${buyAllP2POrder[i].minAmount} ${buyAllP2POrder[i].coin},
Валюта совершения сделки: ${buyAllP2POrder[i].currency},
Способ оплаты: ${buyAllP2POrder[i].paymentSystem},
Курс покупки: ${buyAllP2POrder[i].rate} ${buyAllP2POrder[i].currency.toUpperCase()}.\n\n`
          };
        };
        await bot.sendMessage(userId, messageP2PBuyAllOrder);
        await bot.sendMessage(userId, 'Введите номер ордера по которому хотите начать торговлю', { replyMarkup: backP2PmenuIK, parseMode: 'html' });
        break;

      case 'sellList_p2pOrders':
        setState(userId, 22);
        orderType[userId] = 'sell';
        bot.deleteMessage(userId, messageId);
        const sellAllP2POrder = await CustomP2POrder.find({type: 'buy'});
        if (sellAllP2POrder.length === 0) return bot.sendMessage(userId, 'На данный момент на площадке нету ни 1 ордера такого типа 😞');

        let messageP2PSellAllOrder = '';

        for (let i = 0; i < sellAllP2POrder.length; i++) {
          if (sellAllP2POrder[i].status === 'Done' || sellAllP2POrder[i].status === 'Filling' || sellAllP2POrder[i].status === 'Deleted' && sellAllP2POrder[i].processed) continue
          if(Number(sellAllP2POrder[i].id) === userId) {
            messageP2PSellAllOrder += `Ордер №${sellAllP2POrder[i].orderNumber} (you),
Продаваемая монета: ${sellAllP2POrder[i].coin},
Количество продажи: ${sellAllP2POrder[i].amount} ${sellAllP2POrder[i].coin},
Минимальная сумма продажи монеты: ${sellAllP2POrder[i].minAmount} ${sellAllP2POrder[i].coin},
Валюта совершения сделки: ${sellAllP2POrder[i].currency},
Способ оплаты: ${sellAllP2POrder[i].paymentSystem},
Курс продажи: ${sellAllP2POrder[i].rate} ${sellAllP2POrder[i].currency.toUpperCase()}.\n\n`
          } else {
          messageP2PSellAllOrder += `Ордер №${sellAllP2POrder[i].orderNumber},
Продаваемая монета: ${sellAllP2POrder[i].coin},
Количество продажи: ${sellAllP2POrder[i].amount} ${sellAllP2POrder[i].coin},
Минимальная сумма продажи монеты: ${sellAllP2POrder[i].minAmount} ${sellAllP2POrder[i].coin},
Валюта совершения сделки: ${sellAllP2POrder[i].currency},
Способ оплаты: ${sellAllP2POrder[i].paymentSystem},
Курс продажи: ${sellAllP2POrder[i].rate} ${sellAllP2POrder[i].currency.toUpperCase()}.\n\n`
          };
        };
        await bot.sendMessage(userId, messageP2PSellAllOrder);
        await bot.sendMessage(userId, 'Введите номер ордера по которому хотите начать торговлю', { replyMarkup: backP2PmenuIK, parseMode: 'html' });
        break;

      case 'p2pBuy':
        bot.deleteMessage(userId, messageId);
        orderType[userId] = 'buy';
        firstPage.push('Page2')
        await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(firstPage, 'buyP2P')});
        break;

      case 'p2pSell':
        bot.deleteMessage(userId, messageId);
        firstPage.push('Page2')
        orderType[userId] = 'sell';
        await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(firstPage, 'sellP2P')});
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
            processed: false,
            coin: coin[userId],
            currency: currencyP2P[userId],
            amount: amount[userId],
            rate: userRate[userId],
            minAmount: sum[userId],
            paymentSystem: paymentSystem[userId],
            requisites: requisites[userId]
          });

          await BalanceUserModel.updateOne(
            {id: userId},
            JSON.parse(`{"$inc": { "main.${coin[userId]}": -${amount[userId]} } }`)
          );

          await BalanceUserModel.updateOne(
            {id: userId},
            JSON.parse(`{"$inc": { "hold.${coin[userId]}": ${amount[userId]} } }`)
          );
        } else {
          CustomP2POrder.create({
            id: userId,
            orderNumber: orderNumber[userId],
            typeOrder: 'p2p',
            type: orderType[userId],
            status: 'Selling',
            processed: false,
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
        break;

      case 'p2p_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Отменено ❌ Вы в главном меню!', { replyMarkup: RM_Home });
        break;

      case 'backP2Pmenu':
        bot.deleteMessage(userId, messageId);
        bot.sendMessage(userId, 'Вы перешли в раздел Р2Р:', {replyMarkup: p2pMenuIK});
        break;

      case 'p2pTradeBuy_accept':
        bot.deleteMessage(userId, messageId);
        sum[userId] = selectedOrder[userId].rate * amount[userId];
        await OrderFilling.updateOne(
          {orderNumber: selectedOrder[userId].orderNumber},
          {$set: {status: "Approve"}}
          );
          await bot.sendMessage(userId, `Переведите ${sum[userId]} ${selectedOrder[userId].currency} на банковский счет <code><i>${selectedOrder[userId].requisites}</i></code>. После оплаты нажмите кнопку готово.`, { replyMarkup: payOrder, parseMode: 'html' });
        break;

      case 'p2pTradeBuy_cancel':
        setState(userId, 0);
        bot.deleteMessage(userId, messageId);
        await OrderFilling.deleteOne(
          {orderNumber: selectedOrder[userId].orderNumber}
        );
        await CustomP2POrder.updateOne(
          {orderNumber: selectedOrder[userId].orderNumber},
          {$set: {status: 'Selling'}}
        );
        bot.sendMessage(userId, 'Операция отменена!');
        break;

      case 'payOrderCancel':
        bot.deleteMessage(userId, messageId);
        await OrderFilling.deleteOne(
          {orderNumber: selectedOrder[userId].orderNumber}
        );
        await CustomP2POrder.updateOne(
          {orderNumber: selectedOrder[userId].orderNumber},
          {$set: {status: 'Selling'}}
        );
        await bot.sendMessage(userId, 'Операция отменена!')
        break;

      case 'payOrderAccept':
        bot.deleteMessage(userId, messageId);
        const OrderData = await OrderFilling.findOne({orderNumber: selectedOrder[userId].orderNumber});
        await OrderFilling.updateOne(
          {orderNumber: selectedOrder[userId].orderNumber},
          {$set: {status: 'Accept'}}
        );
          await bot.sendMessage(userId, 'Вы оплатили ордер, ожидайте перевод монет на аккаунт 2 стороной');
          await bot.sendMessage(selectedOrder[userId].id, `Покупатель оплатил ордер, сумма покупки ${OrderData.coinAmount} ${OrderData.coin} = ${OrderData.currencyAmount} ${OrderData.currency}\nПереведите монеты на его счет`, { replyMarkup: generateButton(payOrderCoin, `p2pSendCoin_${selectedOrder[userId].orderNumber}`) });
        break;

      case 'p2pTradeSell_accept':
        bot.deleteMessage(userId, messageId);
        const SellOrderData = await OrderFilling.findOne({orderNumber: selectedOrder[userId].orderNumber});
        await OrderFilling.updateOne(
          {orderNumber: selectedOrder[userId].orderNumber},
          {$set: {status: "Approve"}}
        );

        await BalanceUserModel.updateOne(
          {id: SellOrderData.client},
          JSON.parse(`{"$inc": { "main.${SellOrderData.coin}": -${SellOrderData.coinAmount} } }`)
        );

        await BalanceUserModel.updateOne(
          {id: SellOrderData.client},
          JSON.parse(`{"$inc": { "hold.${SellOrderData.coin}": ${SellOrderData.coinAmount} } }`)
        );

        bot.sendMessage(SellOrderData.client, 'Заявка принята, ожидате зачисления денег на карту...');
        bot.sendMessage(SellOrderData.creatorOrder, `Сработал ордер №${SellOrderData.orderNumber}.
Сумма покупки ${SellOrderData.coinAmount} ${SellOrderData.coin} по курсу ${SellOrderData.rate} ${SellOrderData.currency}.
Переведите ${SellOrderData.currencyAmount} ${SellOrderData.currency} на <i><code>${SellOrderData.requisites}</code></i> и нажмите кнопку <b>«Done»</b> после перевода`, { replyMarkup: generateButton(buyerPayOrder, `buyerPayOrder_${SellOrderData.orderNumber}`), parseMode: 'html' });

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
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите продаваемую монету:', { replyMarkup: generateButton(list[userId], 'sell')});
    }
    else if (data === 'sell_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
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
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'buy')})
    }
    else if(data === 'buy_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, coinSellArray[userId].length);
      list[userId].push('Page3');
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
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push(`Page2`, 'Page4');
      await bot.sendMessage(userId,'Выберите валюту пополнения: ', {replyMarkup: generateButton(list[userId], 'replenishment')});
    }
    else if(data === 'replenishment_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push(`Page3`);
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
      if(data.split('_')[1] === 'usdt') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.usdt.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      } 
      else if(data.split('_')[1] === 'mine' || data.split('_')[1] === 'plex') {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.minePlex.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      } else {
        await bot.sendMessage(userId, `<code>${getInfoUser.userWallet.del.address}</code>`, { replyMarkup: RM_Home, parseMode: 'html' });
      };
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
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push(`Page2`, 'Page4');
      await bot.sendMessage(userId,'Выберите валюту вывода: ', {replyMarkup: generateButton(list[userId], 'withdrawal')});
    }
    else if(data === 'withdrawal_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push(`Page3`);
      await bot.sendMessage(userId,'Выберите валюту вывода: ', {replyMarkup: generateButton(list[userId], 'withdrawal')});
    }
    else if(data.split('_')[0] === 'withdrawal'){
      bot.deleteMessage(userId, messageId);
      let delCoin;
      (data.split('_')[1] === 'mine') || (data.split('_')[1] === 'plex') || (data.split('_')[1] === 'usdt') ? delCoin = false : delCoin = true;

      if (data.split('_')[1] === 'mine' || data.split('_')[1] === 'plex') {
        coin[userId] = data.split('_')[1];
        balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
        minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
        bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия вывода составляет 2 MINE!\nВведите сумму вывода:`, {replyMarkup: RM_Home});
        setState(userId, 27);
      };
      if (data.split('_')[1] === 'usdt') {
        try {
          coin[userId] = data.split('_')[1];
          balanceUserCoin[userId] = getInfoUser.userBalance.main[data.split('_')[1]];
          minimalWithdrawAmount[userId] = minimalSum[data.split('_')[1]];
          await bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия вывода составляет 2USDT!\nВведите сумму вывода:`, {replyMarkup: RM_Home});
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
        bot.sendMessage(userId, `Минимальная сумма вывода ${minimalWithdrawAmount[userId]} ${coin[userId].toUpperCase()}\nКомиссия оплачивается за счёт пользователя!\nВведите сумму вывода:`, {replyMarkup: RM_Home});
        setState(userId, 10);
      }
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
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'sellExchange') });
    }
    else if (data === 'sellExchange_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
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
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyExchange') });
    }
    else if(data === 'buyExchange_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, arrayCoinList.length);
      list[userId].push('Page3');
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
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите покупаемую монету:', { replyMarkup: generateButton(list[userId], 'operaionBuy')});
    }
    else if (data === 'operaionBuy_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
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
      await pageNavigationButton(userId, coinSellArray[userId], 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'operaionSell')});
    }
    else if (data === 'operaionSell_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, coinSellArray[userId], 60, coinSellArray[userId].length);
      list[userId].push('Page3');
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
    else if (data === 'buyP2P_Page1') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 0, 20);
      list[userId].push('Page2');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P')});
    }
    else if (data === 'buyP2P_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P')});
    }
    else if (data === 'buyP2P_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P')});
    }
    else if (data === 'buyP2P_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите купить:', { replyMarkup: generateButton(list[userId], 'buyP2P')});
    }
    else if (data.split('_')[0] === 'buyP2P') {
      bot.deleteMessage(userId, messageId);
      coin[userId] = data.split('_')[1];
      await bot.sendMessage(userId, 'Выбирете валюту совершения сделки:', { replyMarkup: generateButton(currency, 'сurrencyP2P') });
    }
    else if(data === 'сurrencyP2P_UAH'){
      bot.deleteMessage(userId,messageId);
      currencyP2P[userId] = data.split('_')[1];
      bot.sendMessage(userId, 'Выбирете способ облаты:', { replyMarkup: generateButton(paymentSystemUA, 'paymentSystem') });
    }
    else if(data === 'сurrencyP2P_RUB'){
      bot.deleteMessage(userId,messageId);
      currencyP2P[userId] = data.split('_')[1];
      bot.sendMessage(userId, 'Выбирете способ облаты:', { replyMarkup: generateButton(paymentSystemRU, 'paymentSystem') });
    }
    else if(data === 'сurrencyP2P_TRY'){
      bot.deleteMessage(userId,messageId);
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
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P')});
    }
    else if (data === 'sellP2P_Page2') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 20, 40);
      list[userId].push('Page1', 'Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P')});
    }
    else if (data === 'sellP2P_Page3') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 40, 60);
      list[userId].push('Page2', 'Page4');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P')});
    }
    else if (data === 'sellP2P_Page4') {
      bot.deleteMessage(userId, messageId);
      await pageNavigationButton(userId, arrayCoinList, 60, arrayCoinList.length);
      list[userId].push('Page3');
      await bot.sendMessage(userId, 'Выберите монету которую хотите продать:', { replyMarkup: generateButton(list[userId], 'sellP2P')});
    }
    else if (data.split('_')[0] === 'sellP2P') {
      bot.deleteMessage(userId, messageId);
      coin[userId] = data.split('_')[1];
      await bot.sendMessage(userId, 'Выбирете валюту совершения сделки:', { replyMarkup: generateButton(currency, 'сurrencyP2P') });
    }
    else if (data.split('_')[0] === 'buyerPayOrder') {
      bot.deleteMessage(userId, messageId);
      const OrderData = await OrderFilling.findOne({orderNumber: data.split('_')[1]});
        await OrderFilling.updateOne(
          {orderNumber: data.split('_')[1]},
          {$set: {status: 'Accept'}}
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

      if (orderType === 'sell') {
      await BalanceUserModel.updateOne(
        {id: orderData.client},
        JSON.parse(`{"$inc": { "hold.${orderData.coin}": -${orderData.coinAmount} } }`)
      );

      await BalanceUserModel.updateOne(
        {id: orderData.creatorOrder},
        JSON.parse(`{"$inc": { "main.${orderData.coin}": ${orderData.coinAmount} } }`)
      );

      if (orderData.coinAmount === platformOrderData.amount) {
        await CustomP2POrder.updateOne(
          {orderNumber: orderData.orderNumber},
          {$set: {status: 'Done', processed: true}}
        );
      } 
      else if (orderData.coinAmount < platformOrderData.amount){
        await CustomP2POrder.updateOne(
          {orderNumber: orderData.orderNumber},
          {$set: {status: 'Selling'}}
        );

        await CustomP2POrder.updateOne(
          {orderNumber: orderData.orderNumber},
          JSON.parse(`{"$inc": { "amount": -${orderData.coinAmount} } }`)
        );

        sum[userId] = Number(platformOrderData.amount) - Number(orderData.coinAmount);

        if (platformOrderData.minAmount > sum[userId]) {
          await CustomP2POrder.updateOne(
            {orderNumber: orderData.orderNumber},
            JSON.parse(`{ "minAmount": ${sum[userId]} }`)
          );
        };
      };

      await OrderFilling.deleteOne(
        {orderNumber: orderData.orderNumber}
      );

        await bot.sendMessage(orderData.creatorOrder, `Ордер выполнен успешно, ${orderData.coinAmount} ${orderData.coin} будут зачислены на ваш аккаунт ✅`);
        await bot.deleteMessage(orderData.client, messageId);
        await bot.sendMessage(orderData.client, 'Ордер выполнен успешно ✅');        
      } else {
        await BalanceUserModel.updateOne(
          {id: orderData.client},
          JSON.parse(`{"$inc": { "main.${orderData.coin}": ${orderData.coinAmount} } }`)
        );
        await BalanceUserModel.updateOne(
          {id: orderData.creatorOrder},
          JSON.parse(`{"$inc": { "hold.${orderData.coin}": -${orderData.coinAmount} } }`)
        );

        if (orderData.coinAmount === platformOrderData.amount) {
          await CustomP2POrder.updateOne(
            {orderNumber: orderData.orderNumber},
            {$set: {status: 'Done', processed: true}}
          );
        }
        else if (orderData.coinAmount < platformOrderData.amount){
          await CustomP2POrder.updateOne(
            {orderNumber: orderData.orderNumber},
            {$set: {status: 'Selling'}}
          );
  
          await CustomP2POrder.updateOne(
            {orderNumber: orderData.orderNumber},
            JSON.parse(`{"$inc": { "amount": -${orderData.coinAmount} } }`)
          );
  
          sum[userId] = Number(platformOrderData.amount) - Number(orderData.coinAmount);
  
          if (platformOrderData.minAmount > sum[userId]) {
            await CustomP2POrder.updateOne(
              {orderNumber: orderData.orderNumber},
              JSON.parse(`{ "minAmount": ${sum[userId]} }`)
            );
          };
        };
  
        await OrderFilling.deleteOne(
          {orderNumber: orderData.orderNumber}
        );
        await bot.sendMessage(orderData.client, `Ордер выполнен успешно, ${orderData.coinAmount} ${orderData.coin} будут зачислены на ваш аккаунт ✅`);
        await bot.deleteMessage(orderData.creatorOrder, messageId);
        await bot.sendMessage(orderData.creatorOrder, 'Ордер выполнен успешно ✅');
      }
      
    };

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
let digitsBuy = []; // доступное количество покупки согласно заданому курсу и балансу пользователя
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
checkUserTransaction.start();
checkUserUsdtTransaction.start();
chechAdminUsdtTransaction.start();
checkUserExchangeTransaction.start();
// updateCoinBalance.start();
checkOrders.start();
checkUserMinePlexTransaction.start();
chechAdminMinePlexTransaction.start();
checkHashSendAdminComission.start();
