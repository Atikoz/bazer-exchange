const getAllCoinRate = require("../function/getCurrencyRate");

class GetRate {
  constructor() {
    this.rateObj = null;  // Зберігаємо останні дані getAllCoinRate
    this.updateInterval = 15 * 60 * 1000;  // Оновлюємо кожні 15 хвилин
    this.updateRateObj();  // Викликаємо один раз при створенні об'єкту
    setInterval(() => this.updateRateObj(), this.updateInterval);  // Оновлюємо по інтервалу
  }

  updateRateObj = async () => {
    try {
      this.rateObj = await getAllCoinRate();
    } catch (error) {
      console.error(error);
    }
  };

  getCoinRate = async (sellCoin, buyCoin) => {
    try {
      const result = this.rateObj.rub[sellCoin.toLowerCase()] / this.rateObj.rub[buyCoin.toLowerCase()];

      return result;

    } catch (error) {
      console.error(error.message)
      console.log('Rate data not available. Please try again later.')
    }
  };

  getCurrencyRate = async (coin, currency) => {
    try {
      const currObj = this.rateObj[currency.toLowerCase()];

      return +(currObj[coin]).toFixed(2)

    } catch (error) {
      console.error(error)
    }
  };
}

module.exports = new GetRate();