import BalanceService from "../service/balance/BalanceService";

export class UserValidator {
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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
