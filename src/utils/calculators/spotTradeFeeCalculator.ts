import Big from "big.js";
import RateAggregator from "../../service/rate/RateAggregator";


export class SpotTradeFeeCalculator {
  private static readonly commissionPercent = 0.15;
  static readonly commissionCoin = 'cashbsc';

  public static async calculateFull(coin: string, amount: number): Promise<number> {
    const exchangeRate = await RateAggregator.getCoinRate(coin, this.commissionCoin);

    const amountOnePercent = amount / 100;
    const amountPercentFee = this.commissionPercent * amountOnePercent;
    const feeInTradeCurrency = amountPercentFee * exchangeRate;

    return +feeInTradeCurrency.toFixed(6);
  }

  public static calculatePartial(amountSell: number, amountBuy: number, comission: number, orderSellAmount: number, orderBuyAmount: number): number {
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