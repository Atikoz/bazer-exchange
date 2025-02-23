const { getCoinRate } = require('../helpers/getCoinRate.js');
const Big = require('big.js');

class CalculateFee {
  #commissionPercent = 0.15;
  commissionCoin = 'cashbsc';

  //функция для вычисления комиссии за всю сделку
  calculateSpotTradeFee = async (tradeAmount, tradeCoin) => {
    const exchangeRate = await getCoinRate(tradeCoin, this.commissionCoin);

    const amountOnePercent = tradeAmount / 100;
    const amountPercentFee = this.#commissionPercent * amountOnePercent;
    const feeInTradeCurrency = amountPercentFee * exchangeRate;

    return +feeInTradeCurrency.toFixed(6);
  };

  //функция для вычисления комиссии за часть сделки

  calculateFeeTrade = (amountSell, amountBuy, comission, orderSellAmount, orderBuyAmount) => {
    const amountSellBig = new Big(amountSell);
    const amountBuyBig = new Big(amountBuy);
    const comissionBig = new Big(comission);
    const orderSellAmountBig = new Big(orderSellAmount);
    const orderBuyAmountBig = new Big(orderBuyAmount);

    // Відсоток виконання ордера
    const orderExecutionPercent = amountSellBig.div(orderSellAmountBig);

    // Відповідна частина покупки (перевірка, якщо amountBuy не був переданий напряму)
    const adjustedAmountBuy = orderBuyAmountBig.times(orderExecutionPercent);

    // Якщо передано курс, перевіримо відповідність
    if (!amountBuyBig.eq(adjustedAmountBuy)) {
      console.warn(`Warning: amountBuy (${amountBuyBig}) не відповідає розрахунковому (${adjustedAmountBuy}).`);
    }

    // Часткова комісія (множимо одразу на всю комісію!)
    const feeTrade = orderExecutionPercent.times(comissionBig);

    return +feeTrade.toFixed(6);
  }
}

module.exports = new CalculateFee;