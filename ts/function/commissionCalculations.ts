import circumcisionAmount from "../helpers/circumcisionAmount";
import GetRate from "./rate/getRate";

interface CalculateFeeFunction {
  calculateSpotTradeFee: (tradeAmount: number, tradeCoin: string) => Promise<number | void>,
  calculateFeeTrade: (amountSell: number, amountBuy: number, comission: number) => number
}

const calculateFee: CalculateFeeFunction = {
  calculateSpotTradeFee: async function (tradeAmount: number, tradeCoin: string): Promise<number | void> {
    try {
      // Валюта, в которой взимается комиссия
      const feeCurrency = 'cashback';

      // Процент комиссии
      const percentFee = 1;

      // Получение обменного курса между торговой валютой и валютой комиссии
      const exchangeRate = await GetRate.getCoinRate(tradeCoin, feeCurrency);

      if (!exchangeRate) {
        throw new Error('Coin rate is undefind');
      }

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
  },

  calculateFeeTrade: function (amountSell: number, amountBuy: number, comission: number): number {
    try {
      if (amountSell === amountBuy) return comission;
      
      const onePercentSellAmount: number = circumcisionAmount(amountSell / 100);

      const percentBuy = circumcisionAmount(amountBuy / onePercentSellAmount);

      const onePercentComission = circumcisionAmount(comission / 100);

      const feeTrade = percentBuy * onePercentComission;

      return +feeTrade.toFixed(6)
    } catch (error) {
      console.error(error);
      return 0
    }
  }
};

export default calculateFee;