const CustomOrder = require('../model/modelOrder.js');
const BalanceUser = require('../model/modelBalance.js');
const TeleBot = require('telebot');
const config = require('../config.js');
const { calculateFeeTrade } = require('../function/calculateSpotTradeFee.js');
const sendLogs = require('../helpers/sendLog.js');


const bot = new TeleBot(config.token);


let arrBuyOrder = [];
let arrSellOrder = [];

class OrderCheck {
  async SplitOrders() {
    try {
      const buy = [];
      const sell = [];
      const listOrders = await CustomOrder.find({});

      for (let i = 0; i < listOrders.length; i++) {
        if (listOrders[i].status === 'Done' || listOrders[i].status === 'Deleted') continue
        if (listOrders[i].type === 'sell') {
          sell.push(listOrders[i]);
        } else {
          buy.push(listOrders[i]);
        };
      }
      arrBuyOrder = Array.from(buy);
      arrSellOrder = Array.from(sell);
    } catch (error) {
      console.error(error)
    }
  };

  async CheckOrders() {
    try {
      for (let i = 0; i < arrBuyOrder.length; i++) {

        for (let j = 0; j < arrSellOrder.length; j++) {

          // вариант если курсы будут разные
          // const rateOpening = arrBuyOrder[i].rate;

          // // Обчислюємо курс закриття
          // const rateClosing = 1 / rateOpening;

          // вариант если курсы будут одинаковые
          const roundedRateOpening = arrBuyOrder[i].rate.toFixed(4);
          const roundedRateClosing = arrSellOrder[j].rate.toFixed(4);

          if (arrBuyOrder[i].buyCoin === arrSellOrder[j].sellCoin &&
            arrBuyOrder[i].sellCoin === arrSellOrder[j].buyCoin &&
            roundedRateClosing === roundedRateOpening) {


            const conditionSellAmountBigger = arrBuyOrder[i].buyAmount < arrSellOrder[j].sellAmount &&
              arrBuyOrder[i].status !== 'Done' && arrSellOrder[j].status !== 'Done';
            const conditionBuyAmountBigger = arrBuyOrder[i].buyAmount > arrSellOrder[j].sellAmount &&
              arrBuyOrder[i].status !== 'Done' && arrSellOrder[j].status !== 'Done';
            const conditionOrdersMatched = arrBuyOrder[i].buyAmount === arrSellOrder[j].sellAmount &&
              arrBuyOrder[i].status !== 'Done' && arrSellOrder[j].status !== 'Done';


            if (conditionSellAmountBigger) {

              console.log('1');

              const buySumm = arrBuyOrder[i].buyAmount;
              const sellSumm = arrBuyOrder[i].sellAmount;

              const feeTrade = calculateFeeTrade(arrSellOrder[j].sellAmount, buySumm, arrSellOrder[j].comission);

              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "hold.${arrBuyOrder[i].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].buyCoin}": ${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${arrBuyOrder[i].comission} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "hold.${arrSellOrder[j].sellCoin}": -${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].buyCoin}": ${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
              );
              await CustomOrder.updateOne(
                { id: arrBuyOrder[i].id, orderNumber: arrBuyOrder[i].orderNumber },
                { $set: { status: 'Done', processed: true } }
              );
              await CustomOrder.updateOne(
                { id: arrSellOrder[j].id, orderNumber: arrSellOrder[j].orderNumber },
                { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
              );
              bot.sendMessage(arrBuyOrder[i].id, `Ваш ордер №${arrBuyOrder[i].orderNumber} был выполнен ✅`);
              bot.sendMessage(arrSellOrder[j].id, `По вашему ордеру №${arrSellOrder[j].orderNumber} была выполнена продажа в размере ${arrBuyOrder[i].buyAmount} ${(arrBuyOrder[i].buyCoin).toUpperCase()}.
Данные ордера №${arrSellOrder[j].orderNumber} были обновлены!`);
              await sendLogs(`Ордер №${arrBuyOrder[i].orderNumber} был выполнен ✅`);
              await sendLogs(`По ордеру №${arrSellOrder[j].orderNumber} была совершена торговля.`);
              return
            }
            else if (conditionBuyAmountBigger) {

              console.log('2');

              const buySumm = arrSellOrder[j].buyAmount;
              const sellSumm = arrSellOrder[j].sellAmount;
              const feeTrade = calculateFeeTrade(arrBuyOrder[i].sellAmount, buySumm, arrSellOrder[j].comission);


              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "hold.${arrSellOrder[j].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].buyCoin}": ${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${arrSellOrder[j].comission} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].buyCoin}": ${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "hold.${arrBuyOrder[i].sellCoin}": -${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
              );
              await CustomOrder.updateOne(
                { id: arrSellOrder[j].id, orderNumber: arrSellOrder[j].orderNumber },
                { $set: { status: 'Done', processed: true } }
              );
              await CustomOrder.updateOne(
                { id: arrBuyOrder[i].id, orderNumber: arrBuyOrder[i].orderNumber },
                { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
              );
              bot.sendMessage(arrSellOrder[j].id, `Ваш ордер №${arrSellOrder[j].orderNumber} был выполнен ✅`);
              bot.sendMessage(arrBuyOrder[i].id, `По вашему ордеру №${arrBuyOrder[i].orderNumber} была выполнена закупка в размере ${arrSellOrder[j].sellAmount} ${(arrSellOrder[j].sellCoin).toUpperCase()}.
Данные ордера №${arrBuyOrder[i].orderNumber} были обновлены!`);
              await sendLogs(`Ордер №${arrSellOrder[j].orderNumber} был выполнен ✅`);
              await sendLogs(`По ордеру №${arrBuyOrder[i].orderNumber} была совершена торговля.`);

              return
            }
            else if (conditionOrdersMatched) {
              console.log('3');

              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "hold.${arrBuyOrder[i].sellCoin}": -${arrBuyOrder[i].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].buyCoin}": ${arrBuyOrder[i].buyAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${arrBuyOrder[i].comission} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "hold.${arrSellOrder[j].sellCoin}": -${arrSellOrder[j].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].buyCoin}": ${arrSellOrder[j].buyAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${arrSellOrder[j].comission} } }`)
              );
              await CustomOrder.updateOne(
                { id: arrSellOrder[j].id, orderNumber: arrSellOrder[j].orderNumber },
                { $set: { status: 'Done', processed: true } }
              );
              await CustomOrder.updateOne(
                { id: arrBuyOrder[i].id, orderNumber: arrBuyOrder[i].orderNumber },
                { $set: { status: 'Done', processed: true } }
              );
              bot.sendMessage(arrSellOrder[j].id, `Ваш ордер №${arrSellOrder[j].orderNumber} был выполнен ✅`);
              bot.sendMessage(arrBuyOrder[i].id, `Ваш ордер №${arrBuyOrder[i].orderNumber} был выполнен ✅`);
              await sendLogs(`Ордер №${arrSellOrder[j].orderNumber} был выполнен ✅`);
              await sendLogs(`Ордер №${arrBuyOrder[i].orderNumber} был выполнен ✅`);
              return
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = new OrderCheck();

