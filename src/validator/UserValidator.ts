import BalanceService from "../service/balance/BalanceService";
import AuthManager from "../service/user/AuthManager";
import getTranslation, { Language, TranslationMap } from "../translations";
import { ValidationResult } from "./types";

export class UserValidator {
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static async validateRegisterEnteredEmail(userId: number, email: string, lang: Language): Promise<ValidationResult> {
    const isValid = this.isValidEmail(email);
    if (!isValid) {
      return {
        status: false,
        message: getTranslation(lang, 'invalidEmailErrorMessage')
      }
    }

    const { isEmailTaken, isTelegramIdTaken } = await AuthManager.isEmailOrTelegramTaken(userId, email);

    const takenFieldMessageMap: Record<string, boolean> = {
      emailAlreadyTaken: isEmailTaken,
      telegramIdAlreadyTaken: isTelegramIdTaken
    };

    for (const [key, condition] of Object.entries(takenFieldMessageMap)) {
      if (condition) {
        return {
          status: false,
          message: getTranslation(lang, key as keyof TranslationMap)
        };
      }
    }
    return { status: true };
  };

  static async validateAmountInput(userId: number, amount: number, coin: string): Promise<{ success: boolean, message?: string }> {
    try {
      const balanceUser = await BalanceService.getBalance(userId, coin);

      if (isNaN(amount)) {
        throw new Error('Введено не корректное число!');
      }

      if (amount > balanceUser) {
        throw new Error('На вашем балансе не достаточно средств!')
      }

      if (amount <= 0) {
        throw new Error('Сумма должна быть больше 0!')
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
