const getAllCoinRate = require("../function/getCurrencyRate");

class GetRate {
  constructor() {
    this.rateObj = null;  // Зберігаємо останні дані getAllCoinRate
    this.updateInterval = 15 * 60 * 1000;  // Оновлюємо кожні 5 хвилин
    this.updateRateObj();  // Викликаємо один раз при створенні об'єкту
    setInterval(() => this.updateRateObj(), this.updateInterval);  // Оновлюємо по інтервалу
  }

  updateRateObj = async () => {
    try {
      const currency = 'rub';
      this.rateObj = await getAllCoinRate(currency);
    } catch (error) {
      console.error(error);
    }
  };

  getCoinRate = async (sellCoin, buyCoin) => {
    try {
      const result = this.rateObj[sellCoin] / this.rateObj[buyCoin];

      return result;

    } catch (error) {
      console.error('Rate data not available. Please try again later.')
    }
  };

  getCurrencyRate = async (coin, currency) => {
    try {
      const rateObj = await getAllCoinRate(currency.toLowerCase());

      return (rateObj[coin]).toFixed(2)

    } catch (error) {
      console.error(error)
    }
  };
}

module.exports = new GetRate();