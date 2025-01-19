const RateService = require("../function/getCurrencyRate");

class GetRate {
  constructor() {
    this.rateObj = null;  // Зберігаємо останні дані getAllCoinRate
    this.updateInterval = 30 * 60 * 1000;  // Оновлюємо кожні 30 хвилин
    this.updateRateObj();  // Викликаємо один раз при створенні об'єкту
    setInterval(() => this.updateRateObj(), this.updateInterval);  // Оновлюємо по інтервалу
  }

  updateRateObj = async () => {
    try {
      this.rateObj = await RateService.getCoinPrice();
    } catch (error) {
      console.error(error);
    }
  };

  getCoinRate = (sellCoin, buyCoin) => {
    try {
      const result = this.rateObj.rub[sellCoin.toLowerCase()] / this.rateObj.rub[buyCoin.toLowerCase()];

      return result;
    } catch (error) {
      console.error(error.message)
      console.log('Rate data not available. Please try again later.')
    }
  };

  getCurrencyRate = (coin, currency) => {
    try {
      const currObj = this.rateObj[currency.toLowerCase()];

      return +(currObj[coin]).toFixed(2)

    } catch (error) {
      console.error(error)
    }
  };
}

module.exports = new GetRate();