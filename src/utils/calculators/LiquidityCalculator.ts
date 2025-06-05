export class LiquidityCalculator {
  static profitInvestor(percent: number, profitInvestor: number): number {
    const onePercent = profitInvestor / 100;
    return percent * onePercent
  }

  static percentInvestor(sumPool: number, amountInvestor: number): number {
    const onePercentPool = sumPool / 100;
    return amountInvestor / onePercentPool;
  }
}