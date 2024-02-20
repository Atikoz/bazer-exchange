const CustomOrder = require('../model/modelOrder.js');
const BalanceUser = require('../model/modelBalance.js');
const { calculateFeeTrade } = require('../function/calculateSpotTradeFee.js');
const sendLogs = require('../helpers/sendLog.js');
const sendMessage = require('../helpers/tgFunction.js');


let firstHalfOrders = [];
let secondHalfOrders = [];

class OrderCheck {
  async SplitOrders() {
    try {
      const listOrders = await CustomOrder.find({});
      const filteredOrders = listOrders.filter(order => order.status !== 'Done' && order.status !== 'Deleted');
      const middleIndex = Math.floor(filteredOrders.length / 2);

      firstHalfOrders = filteredOrders.slice(0, middleIndex);
      secondHalfOrders = filteredOrders.slice(middleIndex);
    } catch (error) {
      console.error(error)
    }
  };

  async CheckOrders() {
    try {
      for (let i = 0; i < firstHalfOrders.length; i++) {

        for (let j = 0; j < secondHalfOrders.length; j++) {

          const precision = 0.001; // пороговое значение для сравнения

          const roundedRateOpening = firstHalfOrders[i].rate;
          console.log("roundedRateOpening: ", roundedRateOpening);

          const roundedRateClosing = 1 / roundedRateOpening;
          console.log("roundedRateClosing: ", roundedRateClosing);

          const difference = Math.abs(roundedRateClosing - secondHalfOrders[i].rate);
          console.log('difference: ', difference);

          // вариант если курсы будут разные
          // const roundedRateOpening = firstHalfOrders[i].rate;
          // console.log("roundedRateOpening: ", roundedRateOpening);

          // // Обчислюємо курс закриття
          // const roundedRateClosing = Number((1 / roundedRateOpening).toFixed(6));
          // console.log("roundedRateClosing: ", roundedRateClosing);


          // вариант если курсы будут одинаковые
          // const roundedRateOpening = firstHalfOrders[i].rate.toFixed(4);
          // const roundedRateClosing = secondHalfOrders[j].rate.toFixed(4);

          if (firstHalfOrders[i].buyCoin === secondHalfOrders[j].sellCoin &&
            firstHalfOrders[i].sellCoin === secondHalfOrders[j].buyCoin &&
            // roundedRateClosing === secondHalfOrders[i].rate
            difference < precision) {
            console.log('done');

            const conditionSellAmountBigger = firstHalfOrders[i].buyAmount < secondHalfOrders[j].sellAmount;
            const conditionBuyAmountBigger = firstHalfOrders[i].buyAmount > secondHalfOrders[j].sellAmount;
            const conditionOrdersMatched = firstHalfOrders[i].buyAmount === secondHalfOrders[j].sellAmount;


            if (conditionSellAmountBigger) {

              console.log('1');

              const buySumm = firstHalfOrders[i].buyAmount;
              const sellSumm = firstHalfOrders[i].sellAmount;

              const feeTrade = calculateFeeTrade(secondHalfOrders[j].sellAmount, buySumm, secondHalfOrders[j].comission);

              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.${firstHalfOrders[i].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "main.${firstHalfOrders[i].buyCoin}": ${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${firstHalfOrders[i].comission} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.${secondHalfOrders[j].sellCoin}": -${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "main.${secondHalfOrders[j].buyCoin}": ${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
              );
              await CustomOrder.updateOne(
                { id: firstHalfOrders[i].id, orderNumber: firstHalfOrders[i].orderNumber },
                { $set: { status: 'Done' } }
              );
              await CustomOrder.updateOne(
                { id: secondHalfOrders[j].id, orderNumber: secondHalfOrders[j].orderNumber },
                { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
              );
              sendMessage(firstHalfOrders[i].id, `Ваш ордер №${firstHalfOrders[i].orderNumber} был выполнен ✅`);
              sendMessage(secondHalfOrders[j].id, `По вашему ордеру №${secondHalfOrders[j].orderNumber} была выполнена продажа в размере ${firstHalfOrders[i].buyAmount} ${(firstHalfOrders[i].buyCoin).toUpperCase()}.
Данные ордера №${secondHalfOrders[j].orderNumber} были обновлены!`);
              await sendLogs(`Ордер №${firstHalfOrders[i].orderNumber} был выполнен ✅`);
              await sendLogs(`По ордеру №${secondHalfOrders[j].orderNumber} была совершена торговля.`);
              return
            }
            else if (conditionBuyAmountBigger) {

              console.log('2');

              const buySumm = secondHalfOrders[j].buyAmount;
              const sellSumm = secondHalfOrders[j].sellAmount;
              const feeTrade = calculateFeeTrade(firstHalfOrders[i].sellAmount, buySumm, firstHalfOrders[j].comission);


              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.${secondHalfOrders[j].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "main.${secondHalfOrders[j].buyCoin}": ${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${secondHalfOrders[j].comission} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "main.${firstHalfOrders[i].buyCoin}": ${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.${firstHalfOrders[i].sellCoin}": -${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
              );
              await CustomOrder.updateOne(
                { id: secondHalfOrders[j].id, orderNumber: secondHalfOrders[j].orderNumber },
                { $set: { status: 'Done' } }
              );
              await CustomOrder.updateOne(
                { id: firstHalfOrders[i].id, orderNumber: firstHalfOrders[i].orderNumber },
                { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
              );
              sendMessage(secondHalfOrders[j].id, `Ваш ордер №${secondHalfOrders[j].orderNumber} был выполнен ✅`);
              sendMessage(firstHalfOrders[i].id, `По вашему ордеру №${firstHalfOrders[i].orderNumber} была выполнена закупка в размере ${secondHalfOrders[j].sellAmount} ${(secondHalfOrders[j].sellCoin).toUpperCase()}.
Данные ордера №${firstHalfOrders[i].orderNumber} были обновлены!`);
              await sendLogs(`Ордер №${secondHalfOrders[j].orderNumber} был выполнен ✅`);
              await sendLogs(`По ордеру №${firstHalfOrders[i].orderNumber} была совершена торговля.`);

              return
            }
            else if (conditionOrdersMatched) {
              console.log('3');

              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.${firstHalfOrders[i].sellCoin}": -${firstHalfOrders[i].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "main.${firstHalfOrders[i].buyCoin}": ${firstHalfOrders[i].buyAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${firstHalfOrders[i].comission} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.${secondHalfOrders[j].sellCoin}": -${secondHalfOrders[j].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "main.${secondHalfOrders[j].buyCoin}": ${secondHalfOrders[j].buyAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.cashback": -${secondHalfOrders[j].comission} } }`)
              );
              await CustomOrder.updateOne(
                { id: secondHalfOrders[j].id, orderNumber: secondHalfOrders[j].orderNumber },
                { $set: { status: 'Done' } }
              );
              await CustomOrder.updateOne(
                { id: firstHalfOrders[i].id, orderNumber: firstHalfOrders[i].orderNumber },
                { $set: { status: 'Done' } }
              );
              sendMessage(secondHalfOrders[j].id, `Ваш ордер №${secondHalfOrders[j].orderNumber} был выполнен ✅`);
              sendMessage(firstHalfOrders[i].id, `Ваш ордер №${firstHalfOrders[i].orderNumber} был выполнен ✅`);
              await sendLogs(`Ордер №${secondHalfOrders[j].orderNumber} был выполнен ✅`);
              await sendLogs(`Ордер №${firstHalfOrders[i].orderNumber} был выполнен ✅`);
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

