import calculateFee from "../function/commissionCalculations";
import sendLogs from "../helpers/sendLog";
import sendMessage from "../helpers/sendMessage";
import CustomOrder from "../model/modelOrder";
import BalanceUserModel from "../model/modelBalance";


interface OrderSpotTrade {
  id: String,
  orderNumber: Number,
  status: String,
  sellCoin: String,
  buyCoin: String,
  buyAmount: Number,
  sellAmount: Number,
  rate: Number,
  comission: Number
}

const CheckOrders = async (): Promise<void> => {
  try {
    const listOrders: OrderSpotTrade[] = await CustomOrder.find({});
    const filteredOrders = listOrders.filter(order => order.status !== 'Done' && order.status !== 'Deleted');

    for (let i = 0; i < filteredOrders.length; i++) {
      for (let j = i + 1; j < filteredOrders.length; j++) {
        const firstOrder: OrderSpotTrade = filteredOrders[i];
        const secondOrder: OrderSpotTrade = filteredOrders[j];

        // const precision = 0.0005; // пороговое значение для сравнения

        // const roundedRateOpening = firstOrder.rate;
        // console.log("roundedRateOpening: ", roundedRateOpening);

        // const roundedRateClosing = 1 / roundedRateOpening;
        // console.log("roundedRateClosing: ", roundedRateClosing);

        // const difference = Math.abs(roundedRateClosing - secondOrder.rate);
        // console.log('difference: ', difference);

        // вариант если курсы будут разные
        const roundedRateOpening: number = +firstOrder.rate;
        console.log('order №', firstOrder.orderNumber, "roundedRateOpening: ", roundedRateOpening);

        // Обчислюємо курс закриття
        const roundedRateClosing: number = 1 / roundedRateOpening;
        console.log("roundedRateClosing: ", roundedRateClosing);


        // вариант если курсы будут одинаковые
        // const roundedRateOpening = firstOrder.rate.toFixed(4);
        // const roundedRateClosing = secondOrder.rate.toFixed(4);

        if (firstOrder.buyCoin === secondOrder.sellCoin &&
          firstOrder.sellCoin === secondOrder.buyCoin &&
          roundedRateClosing === secondOrder.rate
            /* difference < precision*/) {
          console.log('done');

          const conditionSellAmountBigger: boolean = firstOrder.buyAmount < secondOrder.sellAmount;
          const conditionBuyAmountBigger: boolean = firstOrder.buyAmount > secondOrder.sellAmount;
          const conditionOrdersMatched: boolean = firstOrder.buyAmount === secondOrder.sellAmount;


          if (conditionSellAmountBigger) {

            console.log('1');

            const buySumm: number = +firstOrder.buyAmount;
            const sellSumm: number = +firstOrder.sellAmount;

            const feeTrade: number = calculateFee.calculateFeeTrade(+secondOrder.sellAmount, +buySumm, +secondOrder.comission);
            

            //начисление денег на балансы
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.${firstOrder.sellCoin}": -${sellSumm} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "main.${firstOrder.buyCoin}": ${buySumm} } }`)
            );

            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "hold.${secondOrder.sellCoin}": -${buySumm} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "main.${secondOrder.buyCoin}": ${sellSumm} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${firstOrder.comission} } }`)
            );


            //комиссия
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${firstOrder.comission} } }`)
            );


            //обновление данных ордера
            await CustomOrder.updateOne(
              { id: firstOrder.id, orderNumber: firstOrder.orderNumber },
              { $set: { status: 'Done' } }
            );
            await CustomOrder.updateOne(
              { id: secondOrder.id, orderNumber: secondOrder.orderNumber },
              { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
            );

            sendMessage(+firstOrder.id, `Ваш ордер №${firstOrder.orderNumber} был выполнен ✅`);
            sendMessage(+secondOrder.id, `По вашему ордеру №${secondOrder.orderNumber} была выполнена продажа в размере ${firstOrder.buyAmount} ${(firstOrder.buyCoin).toUpperCase()}.
Данные ордера №${secondOrder.orderNumber} были обновлены!`);
            await sendLogs(`Ордер №${firstOrder.orderNumber} был выполнен ✅`);
            await sendLogs(`По ордеру №${secondOrder.orderNumber} была совершена торговля.`);

            return
          }
          else if (conditionBuyAmountBigger) {

            console.log('2');

            const buySumm: number = +secondOrder.buyAmount;
            const sellSumm: number = +secondOrder.sellAmount;
            const feeTrade: number = calculateFee.calculateFeeTrade(+firstOrder.sellAmount, +buySumm, +firstOrder.comission);

            //начисление денег на балансы
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "hold.${secondOrder.sellCoin}": -${sellSumm} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "main.${secondOrder.buyCoin}": ${buySumm} } }`)
            );

            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "main.${firstOrder.buyCoin}": ${sellSumm} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.${firstOrder.sellCoin}": -${buySumm} } }`)
            );


            //комиссия
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${secondOrder.comission} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${feeTrade} } }`)
            );


            //обновление данных ордеров
            await CustomOrder.updateOne(
              { id: secondOrder.id, orderNumber: secondOrder.orderNumber },
              { $set: { status: 'Done' } }
            );
            await CustomOrder.updateOne(
              { id: firstOrder.id, orderNumber: firstOrder.orderNumber },
              { $inc: { sellAmount: -buySumm, buyAmount: -sellSumm, comission: -feeTrade } }
            );

            sendMessage(+secondOrder.id, `Ваш ордер №${secondOrder.orderNumber} был выполнен ✅`);
            sendMessage(+firstOrder.id, `По вашему ордеру №${firstOrder.orderNumber} была выполнена закупка в размере ${secondOrder.sellAmount} ${(secondOrder.sellCoin).toUpperCase()}.
Данные ордера №${firstOrder.orderNumber} были обновлены!`);
            await sendLogs(`Ордер №${secondOrder.orderNumber} был выполнен ✅`);
            await sendLogs(`По ордеру №${firstOrder.orderNumber} была совершена торговля.`);

            return
          }
          else if (conditionOrdersMatched) {
            console.log('3');

            //начисление денег на балансы
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.${firstOrder.sellCoin}": -${firstOrder.sellAmount} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "main.${firstOrder.buyCoin}": ${firstOrder.buyAmount} } }`)
            );

            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "hold.${secondOrder.sellCoin}": -${secondOrder.sellAmount} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "main.${secondOrder.buyCoin}": ${secondOrder.buyAmount} } }`)
            );


            //комиссия
            await BalanceUserModel.updateOne(
              { id: firstOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${firstOrder.comission} } }`)
            );
            await BalanceUserModel.updateOne(
              { id: secondOrder.id },
              JSON.parse(`{"$inc": { "hold.cashback": -${secondOrder.comission} } }`)
            );


            //обновление статусов ордеров
            await CustomOrder.updateOne(
              { id: secondOrder.id, orderNumber: secondOrder.orderNumber },
              { $set: { status: 'Done' } }
            );
            await CustomOrder.updateOne(
              { id: firstOrder.id, orderNumber: firstOrder.orderNumber },
              { $set: { status: 'Done' } }
            );

            sendMessage(+secondOrder.id, `Ваш ордер №${secondOrder.orderNumber} был выполнен ✅`);
            sendMessage(+firstOrder.id, `Ваш ордер №${firstOrder.orderNumber} был выполнен ✅`);
            await sendLogs(`Ордер №${secondOrder.orderNumber} был выполнен ✅`);
            await sendLogs(`Ордер №${firstOrder.orderNumber} был выполнен ✅`);

            return
          }
        }
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

export default CheckOrders;