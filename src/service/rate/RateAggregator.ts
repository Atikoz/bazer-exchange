import NodeCache from "node-cache";
import CurrencyRate from "./CurrencyRate";
import { getOrderBook } from "./getOrderBook";

const cache = new NodeCache({ stdTTL: 60 * 10 }); // TTL 10 хв

type RateObject = {
  rub: Record<string, number>;
  try: Record<string, number>;
  uah: Record<string, number>;
};

class RateAggregator {
  private rateObj: RateObject | null = null;
  private readonly updateInterval = 10 * 60 * 1000;

  constructor() {
    this.updateRateObj();
    setInterval(() => this.updateRateObj(), this.updateInterval);
  }

  private async updateRateObj(): Promise<void> {
    try {
      const cached = cache.get<RateObject>('rate');

      if (cached) {
        this.rateObj = cached;
        return;
      }

      const rates = await CurrencyRate.getCoinPrice();

      this.rateObj = rates;
      cache.set('rate', rates)
    } catch (error) {
      console.error('Failed to update rateObj:', error);
    }
  }

  private async ensureRateInitialized(): Promise<void> {
    if (!this.rateObj) {
      await this.updateRateObj();
    }
  }

  public async getCoinRate(sellCoin: string, buyCoin: string): Promise<number> {
    await this.ensureRateInitialized();

    const orderBook = await getOrderBook(sellCoin, buyCoin);

    if (orderBook?.price) {
      return orderBook.price;
    }

    const sellRate = this.rateObj?.rub[sellCoin.toLowerCase()];
    const buyRate = this.rateObj?.rub[buyCoin.toLowerCase()];

    console.log(`sellRate: ${sellRate}, buyRate: ${buyRate}`);

    if (sellRate && buyRate) {
      return +(sellRate / buyRate).toFixed(6);
    } else {
      console.warn(`⚠️ Rate not found: ${sellCoin}=${sellRate}, ${buyCoin}=${buyRate}`);
      return null;
    }
  }

  public async getCurrencyRate(coin: string, currency: string): Promise<number | undefined> {
    await this.ensureRateInitialized();

    const rates = this.rateObj?.[currency.toLowerCase() as keyof RateObject];

    if (rates && rates[coin.toLowerCase()]) {
      return +rates[coin.toLowerCase()].toFixed(2);
    } else {
      throw new Error(`Rate for rates: ${rates}, or coin rate: ${rates[coin.toLowerCase()]} not found`);
    }
  }
}

const instance = new RateAggregator();
export default instance;