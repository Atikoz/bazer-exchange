import BalanceService from "../service/balance/BalanceService";

export class MinterValidator {
  static isValidExchangeAmount(amount: number): boolean {
    return !isNaN(amount) && amount > 0;
  }

  static isValidAddress(address: string): boolean {
    return /^Mx[0-9a-fA-F]{40}$/.test(address);
  }

  static isDifferentCoins(sellCoin: string, buyCoin: string): boolean {
    return sellCoin !== buyCoin;
  }

  static async exchangeValidator(userId: number, amount: number, sellCoin: string, feeAmount: number): Promise<{ success: boolean, message?: string }> {
  try {
    const userBalance = await BalanceService.getBalance(userId, sellCoin);
    const balanceFeeCoin = await BalanceService.getBalance(userId, 'bip');

    if (isNaN(amount)) return { success: false, message: 'Введено не корректное число!' };

    if (isNaN(feeAmount)) return { success: false, message: 'Комиссия расчиталась не корректно!' };

    if (feeAmount > balanceFeeCoin) return { success: false, message: `На балансе не достаточно средств для оплаты комиссии, для оплаты требуется ${feeAmount} BIP!` }

    if (userBalance < amount) return { success: false, message: 'На балансе не достаточно средств для обмена!' }

    return { success: true }

  } catch (error) {
    console.error(error)

    return { success: false, message: 'Произошла ошибка при валидации обмена. Попробуйте позже.' };
  }
};
}
