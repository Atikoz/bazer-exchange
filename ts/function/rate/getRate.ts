import RateCurrency from "../../interface/RateCurrency";
import getAllCoinRate from "./getCurrencyRate";

class GetRate {
  private rateObj: RateCurrency | null;
  private updateInterval: number;
  constructor () {
    this.rateObj = null;  // Зберігаємо останні дані getAllCoinRate
    this.updateInterval = 30 * 60 * 1000;  // Оновлюємо кожні 30 хвилин
    this.updateRateObj();  // Викликаємо один раз при створенні об'єкту
    setInterval(() => this.updateRateObj(), this.updateInterval);  // Оновлюємо по інтервалу
  };

  public updateRateObj = async (): Promise<void> => {
    try {
      this.rateObj = await getAllCoinRate();
    } catch (error) {
      console.error(error);
    }
  };

  public getCoinRate = async (sellCoin: string, buyCoin: string): Promise<number | null> => {
    try {
      if (this.rateObj === null) {
        throw new Error('Rate data not available. Please try again later.');
      }

      const sellCoinLower = sellCoin.toLowerCase();
      const buyCoinLower = buyCoin.toLowerCase();

      if (!this.rateObj.rub || !this.rateObj.rub[sellCoinLower] || !this.rateObj.rub[buyCoinLower]) {
        throw new Error('Rates for specified coins not available.');
      }

      const result = this.rateObj.rub[sellCoinLower] / this.rateObj.rub[buyCoinLower];

      return result;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  public getCurrencyRate = (coin: string, currency: string): number | null => {
    try {
      if (this.rateObj === null) {
        throw new Error('Rate data not available. Please try again later.');
      }
      const currObj: object = this.rateObj[currency.toLowerCase()];
  
      return +(currObj[coin]).toFixed(2);
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }
}

export default new GetRate;