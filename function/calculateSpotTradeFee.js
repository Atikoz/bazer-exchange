const circumcisionAmount = require('../helpers/circumcisionAmount.js');
const { getCoinRate } = require('../helpers/getCoinRate.js');

class CalculateFee {
  #commissionPercent = 0.15;
  commissionCoin = 'cashbsc';

  //функция для вычисления комиссии за всю сделку
  calculateSpotTradeFee = async (tradeAmount, tradeCoin) => {
    const exchangeRate = getCoinRate(tradeCoin, this.commissionCoin);

    const amountOnePercent = tradeAmount / 100;
    const amountPercentFee = this.#commissionPercent * amountOnePercent;
    const feeInTradeCurrency = amountPercentFee * exchangeRate;

    return +feeInTradeCurrency.toFixed(6);
  };

  //функция для вычисления комиссии за часть сделки
  calculateFeeTrade = (amountSell, amountBuy, comission) => {
    if (amountSell === amountBuy) return comission;

    const onePercentSellAmount = circumcisionAmount(amountSell / (100 / this.#commissionPercent));

    const percentBuy = circumcisionAmount(amountBuy / onePercentSellAmount);

    const onePercentComission = circumcisionAmount(comission / (100 / this.#commissionPercent));

    const feeTrade = percentBuy * onePercentComission;

    return +feeTrade.toFixed(6)
  }
}

module.exports = new CalculateFee;