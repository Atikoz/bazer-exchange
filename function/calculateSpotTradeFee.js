const circumcisionAmount = require('../helpers/circumcisionAmount.js');
const { getCoinRate } = require('../helpers/getCoinRate.js');

class calculateFee {
  //функция для вычисления комиссии за всю сделку
  calculateSpotTradeFee = async (tradeAmount, tradeCoin) => {
    try {
      // Валюта, в которой взимается комиссия
      const feeCurrency = 'cashback';

      // Процент комиссии
      const percentFee = 1;

      // Получение обменного курса между торговой валютой и валютой комиссии
      const exchangeRate = await getCoinRate(tradeCoin, feeCurrency);
      console.log('exchangeRate: ', exchangeRate);

      // Расчет суммы, равной 1% от суммы сделки
      const amountOnePercent = tradeAmount / 100;

      // Расчет суммы комиссии в валюте комиссии
      const amountPercentFee = percentFee * amountOnePercent;

      // Расчет суммы комиссии в торговой валюте
      const feeInTradeCurrency = amountPercentFee * exchangeRate;

      return Number(feeInTradeCurrency.toFixed(6));
    } catch (error) {
      console.error(error);
    }
  };

  //функция для вычисления комиссии за часть сделки
  calculateFeeTrade = (amountSell, amountBuy, comission) => {
    try {
      if (amountSell === amountBuy) return comission;
      
      const onePercentSellAmount = circumcisionAmount(amountSell / 100);

      const percentBuy = circumcisionAmount(amountBuy / onePercentSellAmount);

      const onePercentComission = circumcisionAmount(comission / 100);

      const feeTrade = percentBuy * onePercentComission;

      return +feeTrade.toFixed(6)
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = new calculateFee();