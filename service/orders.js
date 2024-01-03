const CustomOrder = require('../model/modelOrder.js');
const BalanceUser = require('../model/modelBalance.js');
const TeleBot = require('telebot');
const config = require('../config.js');

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
        if (listOrders[i].status === 'Done' && listOrders[i].processed) continue
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

          if (arrBuyOrder[i].buyCoin === arrSellOrder[j].sellCoin &&
            arrBuyOrder[i].sellCoin === arrSellOrder[j].buyCoin &&
            arrBuyOrder[i].rate === arrSellOrder[j].rate) {

            const conditionSellAmountBigger = arrBuyOrder[i].buyAmount < arrSellOrder[j].sellAmount &&
              arrBuyOrder[i].status !== 'Done' && arrSellOrder[j].status !== 'Done';
            const conditionBuyAmountBigger = arrBuyOrder[i].buyAmount > arrSellOrder[j].sellAmount &&
              arrBuyOrder[i].status !== 'Done' && arrSellOrder[j].status !== 'Done';
            const conditionOrdersMatched = arrBuyOrder[i].buyAmount === arrSellOrder[j].sellAmount &&
              arrBuyOrder[i].status !== 'Done' && arrSellOrder[j].status !== 'Done';


            if (conditionSellAmountBigger) {

              const buySumm = arrBuyOrder[i].buyAmount;
              const sellSumm = arrBuyOrder[i].sellAmount;

              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].buyCoin}": ${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].sellCoin}": -${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].buyCoin}": ${sellSumm} } }`)
              );
              await CustomOrder.updateOne(
                { id: arrBuyOrder[i].id, orderNumber: arrBuyOrder[i].orderNumber },
                { $set: { status: 'Done', processed: true } }
              );
              await CustomOrder.updateOne(
                { id: arrSellOrder[j].id, orderNumber: arrSellOrder[j].orderNumber },
                { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm } }
              );
              bot.sendMessage(arrBuyOrder[i].id, `Ваш ордер №${arrBuyOrder[i].orderNumber} был выполнен ✅`);
              bot.sendMessage(arrSellOrder[j].id, `По вашему ордеру №${arrSellOrder[j].orderNumber} была выполнена продажа в размере ${arrBuyOrder[i].buyAmount} ${(arrBuyOrder[i].buyCoin).toUpperCase()}.
  Данные ордера №${arrSellOrder[j].orderNumber} были обновлены!`);
              return
            }

            else if (conditionBuyAmountBigger) {

              const buySumm = arrSellOrder[j].buyAmount;
              const sellSumm = arrSellOrder[j].sellAmount;
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].buyCoin}": ${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].buyCoin}": ${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].sellCoin}": -${buySumm} } }`)
              );
              await CustomOrder.updateOne(
                { id: arrSellOrder[j].id, orderNumber: arrSellOrder[j].orderNumber },
                { $set: { status: 'Done', processed: true } }
              );
              await CustomOrder.updateOne(
                { id: arrBuyOrder[i].id, orderNumber: arrBuyOrder[i].orderNumber },
                { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm } }
              );
              bot.sendMessage(arrSellOrder[j].id, `Ваш ордер №${arrSellOrder[j].orderNumber} был выполнен ✅`);
              bot.sendMessage(arrBuyOrder[i].id, `По вашему ордеру №${arrBuyOrder[i].orderNumber} была выполнена закупка в размере ${arrSellOrder[j].sellAmount} ${(arrSellOrder[j].sellCoin).toUpperCase()}.
  Данные ордера №${arrBuyOrder[i].orderNumber} были обновлены!`);
              return
            }

            else if (conditionOrdersMatched) {
              console.log('ordeers matched!');
              console.log('buy order№', arrBuyOrder[i].orderNumber, '|||||||', 'sell order№', arrSellOrder[j].orderNumber);
              console.log(arrBuyOrder[i].status, arrBuyOrder[i].processed, '|||||||', arrSellOrder[j].status, arrSellOrder[j].processed);

              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].sellCoin}": -${arrBuyOrder[i].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrBuyOrder[i].id },
                JSON.parse(`{"$inc": { "main.${arrBuyOrder[i].buyCoin}": ${arrBuyOrder[i].buyAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].sellCoin}": -${arrSellOrder[j].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: arrSellOrder[j].id },
                JSON.parse(`{"$inc": { "main.${arrSellOrder[j].buyCoin}": ${arrSellOrder[j].buyAmount} } }`)
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

