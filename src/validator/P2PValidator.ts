import getTranslation, { Language } from "../translations";

export class P2PValidator {
  static validateMinTradeAmount(minSellAmount: number, sellingAmount: number, typeOrder: 'sell' | 'buy', lang: Language): { success: boolean, message?: string } {
    if (isNaN(minSellAmount)) {
      return { success: false, message: getTranslation(lang, 'incorrectNumberAlert') };
    }

    if (minSellAmount <= 0) {
      return { success: false, message: getTranslation(lang, 'textErrorAmountGreaterThan0') };
    }

    if (minSellAmount > sellingAmount) {
      return { success: false, message: `Минимальная сумма не должна превышать сумму ${typeOrder === 'buy' ? 'покупки' : 'продажи'} монеты!` };
    }

    return { success: true };
  }

  static validateEnteredUserRate(rate: number, lang: Language): { success: boolean, message?: string } {
    if (isNaN(rate)) {
      return { success: false, message: getTranslation(lang, 'incorrectNumberAlert') };
    }

    if (rate <= 0) {
      return { success: false, message: getTranslation(lang, 'textErrorAmountGreaterThan0') };
    }

    return { success: true };
  }

  static validateOrderAmount({
    enteredAmount,
    balance,
    minAmount,
    maxAmount,
    lang
  }: {
    enteredAmount: number;
    balance: number;
    minAmount: number;
    maxAmount: number;
    lang: Language;
  }): { success: boolean; message?: string } {
    if (isNaN(enteredAmount)) {
      return { success: false, message: getTranslation(lang, 'incorrectNumberAlert') };
    }

    if (enteredAmount > balance) {
      return { success: false, message: 'На вашем балансе недостаточно средств!' };
    }

    if (enteredAmount < minAmount) {
      return { success: false, message: 'Введено количество меньше минимального!' };
    }

    if (enteredAmount > maxAmount) {
      return { success: false, message: 'Введено количество больше максимального!' };
    }

    return { success: true };
  }

  static checkOrderAmountLimits({
    enteredAmount,
    minAmount,
    maxAmount,
    lang
  }: {
    enteredAmount: number;
    minAmount: number;
    maxAmount: number;
    lang: Language;
  }): { success: boolean; message?: string } {
    if (isNaN(enteredAmount)) {
      return {
        success: false,
        message: getTranslation(lang, 'incorrectNumberAlert')
      };
    }

    if (enteredAmount < minAmount) {
      return {
        success: false,
        message: 'Введено количество меньше минимального!'
      };
    }

    if (enteredAmount > maxAmount) {
      return {
        success: false,
        message: 'Введено количество больше максимального!'
      };
    }

    return { success: true };
  }
}
