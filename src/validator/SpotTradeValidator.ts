import BalanceService from "../service/balance/BalanceService";
import getTranslation, { Language } from "../translations";
import { SpotTradeFeeCalculator } from "../utils/calculators/spotTradeFeeCalculator";
import { ValidationResult } from "./types";

export class SpotTradeValidator {
  static async validateTradeAmount(userId: number, tradeAmount: number, maxOrderAmount: number, coin: string): Promise<ValidationResult> {
    try {
      const balanceUser = await BalanceService.getBalance(userId, coin);

      if (tradeAmount > maxOrderAmount) {
        throw new Error('Сумма покупки монеты указана больше чем в ордере!')
      }

      if (isNaN(tradeAmount)) {
        throw new Error('Введено не корректное число!');
      }

      if (tradeAmount > balanceUser) {
        throw new Error('На вашем балансе не достаточно средств!')
      }

      if (tradeAmount <= 0) {
        throw new Error('Сумма должна быть больше 0!')
      }

      return { status: true };
    } catch (error) {
      return {
        status: false,
        message: error.message
      }
    }
  }

  static async validateSellAmount(userId: number, tradeAmount: number, commission: number, sellCoin: string, lang: Language): Promise<ValidationResult> {
    try {
      const [balanceFeeCoin, balanceSellCoin] = await Promise.all([
        BalanceService.getBalance(userId, SpotTradeFeeCalculator.commissionCoin),
        BalanceService.getBalance(userId, sellCoin)
      ])

      if (isNaN(tradeAmount)) {
        throw new Error(getTranslation(lang, "incorrectNumberAlert"))
      }

      if (balanceFeeCoin < commission) {
        throw new Error(`${getTranslation(lang, "insufficientFundsForCommissionAlert")}, ${commission} ${SpotTradeFeeCalculator.commissionCoin}`)
      }

      if (tradeAmount > balanceSellCoin) {
        throw new Error(getTranslation(lang, "alertInsufficientFundsWithoutCommission"))
      }

      return { status: true }
    } catch (error) {
      return {
        status: false,
        message: error.message
      }
    }
  }

  static async validateComission(userId: number, comission: number): Promise<ValidationResult> {
    try {
      const balanceComissionCoin = await BalanceService.getBalance(userId, SpotTradeFeeCalculator.commissionCoin);

      if (comission < 0) {
        throw new Error('Комиссия не может быть отрицательной!');
      }

      if (isNaN(comission)) {
        throw new Error('Ошибка вычесления комиссии! Попробуйте позже.');
      }

      if (comission > balanceComissionCoin) {
        throw new Error(`Недостаточно средств для оплаты комиссии! На балансе ${SpotTradeFeeCalculator.commissionCoin} - ${balanceComissionCoin}`);
      }

      return { status: true }
    } catch (error) {
      return {
        status: false,
        message: error.message
      }
    }
  }
}