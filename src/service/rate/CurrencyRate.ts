import CoinGecko from "coingecko-api";
import staticMinterRates from "../../config/statikMinterRate";
import { fromBaseUnit } from "../../utils/unitConversion";
import BalanceUser from "../../models/user/BalanceModel";
import { safeGet } from "../../function/safeGet";


interface RateResponse {
  rub: Record<string, number>;
  uah: Record<string, number>;
  try: Record<string, number>;
}

interface DecimalCoin {
  symbol: string;
  titile: string;
  current_price: string;
}

interface DollarRate {
  rub: number;
  uah: number;
  try: number
}

class CurrencyRate {
  private staticMinterRates = staticMinterRates;
  private readonly CoinGeckoClient = new CoinGecko();

  async getDollarRate(): Promise<Record<string, number>> {
    const data = await this.CoinGeckoClient.simple.price({
      ids: ['usd'],
      vs_currencies: ['try', 'uah', 'rub'],
    });

    return data.data.usd;
  }

  async getMinterCoinPrice(dollarRate: DollarRate): Promise<Record<string, Record<string, number>>> {
    const coinsPrice = await this.fetchMinterCoinsPriceToUsdt()

    const neededSymbols = ['hub', 'monsterhub', 'cashbsc', 'ruble', 'bazercoin', 'bip'];

    const filteredPrices = coinsPrice.filter((coin) =>
      neededSymbols.includes(coin.symbol.toLowerCase())
    );

    const updatedPrices = filteredPrices.reduce((acc, coin) => {
      const symbol = coin.symbol.toLowerCase();
      acc[symbol] = {
        uah: coin.price_usd * dollarRate.uah,
        rub: coin.price_usd * dollarRate.rub,
        try: coin.price_usd * dollarRate.try,
      };
      return acc;
    }, {});

    return { ...this.staticMinterRates, ...updatedPrices };
  }

  private async fetchMinterCoinsPriceToUsdt() {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch('https://explorer-api.minter.network/api/v2/coins', requestOptions);
    const resultApi = await response.json();

    return resultApi.data
  }

  private async getDecimalCoinPrice(): Promise<DecimalCoin[]> {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    try {
      const res = await fetch('https://api.decimalchain.com/api/v1/coins/coins?limit=1000&offset=0', requestOptions);
      const json = await res.json();

      return json.Result[0].coins;
    } catch (error) {
      console.error(`Error fetching data Decimal coins:`, error);
      throw error;
    }
  }

  async getCoinPrice(): Promise<RateResponse> {
    try {
      const [cg, decimalPrice, userBalance] = await Promise.all([
        this.CoinGeckoClient.simple.price({
          ids: ['crossfi-2', 'artery', 'decimal', 'tether', 'binancecoin', 'usd'],
          vs_currencies: ['rub', 'uah', 'try']
        }),
        this.getDecimalCoinPrice(),
        BalanceUser.findOne()
      ]);

      const coinGecPrice = cg.data;
      const coinList = Object.keys(userBalance.main);
      const minterPrice = await this.getMinterCoinPrice(coinGecPrice.usd);

      console.log(coinGecPrice)

      const buildRate = (cur: keyof RateResponse): Record<string, number> => {
        const base: Record<string, number> = {
          del: safeGet(coinGecPrice, 'decimal', cur),
          usdt: safeGet(coinGecPrice, 'tether', cur),
          mine: 0.000092,
          plex: safeGet(coinGecPrice, 'plex', cur),
          mpx: cur === 'rub' ? 2.05 : cur === 'uah' ? 0.8422 : 0.7114,
          xfi: safeGet(coinGecPrice, 'crossfi-2', cur),
          artery: safeGet(coinGecPrice, 'artery', cur),
          bip: safeGet(minterPrice, 'bip', cur),
          usdtbsc: safeGet(coinGecPrice, 'tether', cur),
          monsterhub: safeGet(minterPrice, 'monsterhub', cur),
          bnb: safeGet(coinGecPrice, 'binancecoin', cur),
          hub: safeGet(minterPrice, 'hub', cur),
          bipkakaxa: safeGet(minterPrice, 'bipkakaxa', cur),
          cashbsc: safeGet(minterPrice, 'cashbsc', cur),
          minterBazercoin: safeGet(minterPrice, 'bazercoin', cur),
          ruble: safeGet(minterPrice, 'ruble', cur),
          bazerhub: safeGet(minterPrice, 'hub', cur),
          bzr: 0.001 * coinGecPrice.usd[cur]
        };

        for (const coin of coinList) {
          if (!base[coin]) {
            const found: DecimalCoin = decimalPrice.find(item => item.symbol === coin);
            if (found) {
              base[coin] = +fromBaseUnit(found.current_price) * base.del;
            }
          }
        }

        return base;
      };

      return {
        rub: buildRate('rub'),
        uah: buildRate('uah'),
        try: buildRate('try')
      };

    } catch (error) {
      console.error('Error fetching combined rates:', error);
      throw error;
    }
  }
}

export default new CurrencyRate;