const CustomOrder = require('../model/modelOrder.js');
const BalanceUser = require('../model/modelBalance.js');
const { calculateFeeTrade } = require('../function/calculateSpotTradeFee.js');
const sendLogs = require('../helpers/sendLog.js');
const sendMessage = require('../helpers/tgFunction.js');
const poolProfitManagement = require('../helpers/poolProfitManagement.js');


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

          // const precision = 0.0005; // пороговое значение для сравнения

          // const roundedRateOpening = firstHalfOrders[i].rate;
          // console.log("roundedRateOpening: ", roundedRateOpening);

          // const roundedRateClosing = 1 / roundedRateOpening;
          // console.log("roundedRateClosing: ", roundedRateClosing);

          // const difference = Math.abs(roundedRateClosing - secondHalfOrders[j].rate);
          // console.log('difference: ', difference);

          // вариант если курсы будут разные
          const roundedRateOpening = firstHalfOrders[i].rate;
          console.log("roundedRateOpening: ", roundedRateOpening);

          // Обчислюємо курс закриття
          const roundedRateClosing = Number(1 / roundedRateOpening);
          console.log("roundedRateClosing: ", roundedRateClosing);


          // вариант если курсы будут одинаковые
          // const roundedRateOpening = firstHalfOrders[i].rate.toFixed(4);
          // const roundedRateClosing = secondHalfOrders[j].rate.toFixed(4);

          if (firstHalfOrders[i].buyCoin === secondHalfOrders[j].sellCoin &&
            firstHalfOrders[i].sellCoin === secondHalfOrders[j].buyCoin &&
            roundedRateClosing === secondHalfOrders[j].rate
            /* difference < precision*/) {
            console.log('done');

            const conditionSellAmountBigger = firstHalfOrders[i].buyAmount < secondHalfOrders[j].sellAmount;
            const conditionBuyAmountBigger = firstHalfOrders[i].buyAmount > secondHalfOrders[j].sellAmount;
            const conditionOrdersMatched = firstHalfOrders[i].buyAmount === secondHalfOrders[j].sellAmount;


            if (conditionSellAmountBigger) {

              console.log('1');

              const buySumm = firstHalfOrders[i].buyAmount;
              const sellSumm = firstHalfOrders[i].sellAmount;

              const feeTrade = calculateFeeTrade(secondHalfOrders[j].sellAmount, buySumm, secondHalfOrders[j].comission);


              //начисление денег на балансы
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.${firstHalfOrders[i].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "main.${firstHalfOrders[i].buyCoin}": ${buySumm} } }`)
              );

              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.${secondHalfOrders[j].sellCoin}": -${buySumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "main.${secondHalfOrders[j].buyCoin}": ${sellSumm} } }`)
              );


              //комиссия
              if (firstHalfOrders[i].comission === 0) {
                await BalanceUser.updateOne(
                  { id: secondHalfOrders[j].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
                );

                if (firstHalfOrders[i].id === 1511153147) {
                  await poolProfitManagement(1511153147, feeTrade);

                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${feeTrade} CASHBACK.`);
                } else {
                  const onePercentFirstOrderComission = feeTrade / 100;
                  const percentVova = onePercentFirstOrderComission * 15;
                  const percentInvestor = onePercentFirstOrderComission * 85;

                  await poolProfitManagement(1511153147, percentVova);
                  await poolProfitManagement(firstHalfOrders[i].id, percentInvestor);

                  sendLogs(`Пользователю ${firstHalfOrders[i].id} начислена награда из пулов ликвидности в размере: ${percentInvestor} CASHBACK.`);
                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${percentVova} CASHBACK.`);
                }
              }
              else if (secondHalfOrders[j].comission === 0) {
                await BalanceUser.updateOne(
                  { id: firstHalfOrders[i].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${firstHalfOrders[i].comission} } }`)
                );

                if (secondHalfOrders[j].id === 1511153147) {
                  await poolProfitManagement(1511153147, firstHalfOrders[i].comission);

                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${firstHalfOrders[i].comission} CASHBACK.`);
                } else {
                  const onePercentFirstOrderComission = firstHalfOrders[i].comission / 100;
                  const percentVova = onePercentFirstOrderComission * 15;
                  const percentInvestor = onePercentFirstOrderComission * 85;

                  await poolProfitManagement(1511153147, percentVova);
                  await poolProfitManagement(secondHalfOrders[j].id, percentInvestor);

                  sendLogs(`Пользователю ${secondHalfOrders[j].id} начислена награда из пулов ликвидности в размере: ${percentInvestor} CASHBACK.`);
                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${percentVova} CASHBACK.`);
                }
              } else {
                await BalanceUser.updateOne(
                  { id: secondHalfOrders[j].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
                );
                await BalanceUser.updateOne(
                  { id: firstHalfOrders[i].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${firstHalfOrders[i].comission} } }`)
                );
              }


              //обновление данных ордера
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
              const feeTrade = calculateFeeTrade(firstHalfOrders[i].sellAmount, buySumm, firstHalfOrders[i].comission);

              //начисление денег на балансы
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.${secondHalfOrders[j].sellCoin}": -${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "main.${secondHalfOrders[j].buyCoin}": ${buySumm} } }`)
              );

              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "main.${firstHalfOrders[i].buyCoin}": ${sellSumm} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.${firstHalfOrders[i].sellCoin}": -${buySumm} } }`)
              );


              //комиссия
              if (firstHalfOrders[i].comission === 0) {
                await BalanceUser.updateOne(
                  { id: secondHalfOrders[j].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${secondHalfOrders[j].comission} } }`)
                );

                if (firstHalfOrders[i].id === 1511153147) {
                  await poolProfitManagement(1511153147, secondHalfOrders[j].comission);

                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${secondHalfOrders[j].comission} CASHBACK.`);
                } else {
                  const onePercentFirstOrderComission = secondHalfOrders[j].comission / 100;
                  const percentVova = onePercentFirstOrderComission * 15;
                  const percentInvestor = onePercentFirstOrderComission * 85;

                  await poolProfitManagement(1511153147, percentVova);
                  await poolProfitManagement(firstHalfOrders[i].id, percentInvestor);

                  sendLogs(`Пользователю ${firstHalfOrders[i].id} начислена награда из пулов ликвидности в размере: ${percentInvestor} CASHBACK.`);
                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${percentVova} CASHBACK.`);
                }
              }
              else if (secondHalfOrders[j].comission === 0) {
                await BalanceUser.updateOne(
                  { id: firstHalfOrders[i].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
                );

                if (secondHalfOrders[j].id === 1511153147) {
                  await poolProfitManagement(1511153147, feeTrade);

                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${feeTrade} CASHBACK.`);
                } else {
                  const onePercentFirstOrderComission = feeTrade / 100;
                  const percentVova = onePercentFirstOrderComission * 15;
                  const percentInvestor = onePercentFirstOrderComission * 85;

                  await poolProfitManagement(1511153147, percentVova);
                  await poolProfitManagement(secondHalfOrders[j].id, percentInvestor);

                  sendLogs(`Пользователю ${secondHalfOrders[j].id} начислена награда из пулов ликвидности в размере: ${percentInvestor} CASHBACK.`);
                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${percentVova} CASHBACK.`);
                }
              } else {
                await BalanceUser.updateOne(
                  { id: secondHalfOrders[j].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${secondHalfOrders[j].comission} } }`)
                );
                await BalanceUser.updateOne(
                  { id: firstHalfOrders[i].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
                );
              }

              //обновление данных ордеров
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

              //начисление денег на балансы
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "hold.${firstHalfOrders[i].sellCoin}": -${firstHalfOrders[i].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: firstHalfOrders[i].id },
                JSON.parse(`{"$inc": { "main.${firstHalfOrders[i].buyCoin}": ${firstHalfOrders[i].buyAmount} } }`)
              );

              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "hold.${secondHalfOrders[j].sellCoin}": -${secondHalfOrders[j].sellAmount} } }`)
              );
              await BalanceUser.updateOne(
                { id: secondHalfOrders[j].id },
                JSON.parse(`{"$inc": { "main.${secondHalfOrders[j].buyCoin}": ${secondHalfOrders[j].buyAmount} } }`)
              );


              //комиссия
              if (firstHalfOrders[i].comission === 0) {
                await BalanceUser.updateOne(
                  { id: secondHalfOrders[j].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${secondHalfOrders[j].comission} } }`)
                );

                if (firstHalfOrders[i].id === 1511153147) {
                  await poolProfitManagement(1511153147, secondHalfOrders[j].comission);

                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${secondHalfOrders[j].comission} CASHBACK.`);
                } else {
                  const onePercentFirstOrderComission = secondHalfOrders[j].comission / 100;
                  const percentVova = onePercentFirstOrderComission * 15;
                  const percentInvestor = onePercentFirstOrderComission * 85;

                  await poolProfitManagement(1511153147, percentVova);
                  await poolProfitManagement(firstHalfOrders[i].id, percentInvestor);

                  sendLogs(`Пользователю ${firstHalfOrders[i].id} начислена награда из пулов ликвидности в размере: ${percentInvestor} CASHBACK.`);
                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${percentVova} CASHBACK.`);
                }
              }
              else if (secondHalfOrders[j].comission === 0) {
                await BalanceUser.updateOne(
                  { id: firstHalfOrders[i].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${firstHalfOrders[i].comission} } }`)
                );

                if (secondHalfOrders[j].id === 1511153147) {
                  await poolProfitManagement(1511153147, firstHalfOrders[i].comission);

                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${firstHalfOrders[i].comission} CASHBACK.`);
                } else {
                  const onePercentFirstOrderComission = firstHalfOrders[i].comission / 100;
                  const percentVova = onePercentFirstOrderComission * 15;
                  const percentInvestor = onePercentFirstOrderComission * 85;

                  await poolProfitManagement(1511153147, percentVova);
                  await poolProfitManagement(secondHalfOrders[j].id, percentInvestor);

                  sendLogs(`Пользователю ${secondHalfOrders[j].id} начислена награда из пулов ликвидности в размере: ${percentInvestor} CASHBACK.`);
                  sendLogs(`Пользователю 1511153147 начислена награда из пулов ликвидности в размере: ${percentVova} CASHBACK.`);
                }
              } else {
                await BalanceUser.updateOne(
                  { id: firstHalfOrders[i].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${firstHalfOrders[i].comission} } }`)
                );
                await BalanceUser.updateOne(
                  { id: secondHalfOrders[j].id },
                  JSON.parse(`{"$inc": { "hold.cashback": -${secondHalfOrders[j].comission} } }`)
                );
              }


              //обновление статусов ордеров
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

