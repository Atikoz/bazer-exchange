import { withdrawCommissionMap } from "../config/withdrawal/withdrawCommissionMap";
import { RM_Home } from "../keyboards";
import BalanceService from "../service/balance/BalanceService";
import BotService from "../service/telegram/BotService";
import { Language } from "../translations";

export class WithdrawalValidator {
  static async validateWithdrawAmount({
    userId,
    coinCode,
    textAmount,
    minAmount,
    userBalance,
    userLang,
    setState,
  }: {
    userId: number;
    coinCode: string;
    textAmount: string;
    minAmount: number;
    userBalance: number;
    userLang: Language;
    setState: (id: number, state: number) => void;
  }): Promise<number | null> {
    const amount = Number(textAmount);

    if (isNaN(+textAmount)) {
      await BotService.sendMessage(userId, 'Введено не корректное число!');
      setState(userId, 0);
      return null;
    }

    const config = withdrawCommissionMap[coinCode];
    if (!config) {
      await BotService.sendMessage(userId, 'Вывод для этой монеты временно недоступен.');
      setState(userId, 0);
      return null;
    }

    if (minAmount > amount) {
      await BotService.sendMessage(userId, 'Вы ввели сумму ниже минимальной.');
      setState(userId, 0);
      return null;
    }

    let fee = 0;

    if (config.fixedFee) {
      fee = config.fixedFee;
    } else if (config.percentFee) {
      fee = amount * config.percentFee;
      if (config.minFee) fee = Math.max(fee, config.minFee);
    }

    const total = amount + fee;

    if (total > userBalance) {
      await BotService.sendMessage(
        userId,
        `Недостаточно средств. Нужно ${total} ${coinCode.toUpperCase()} (включая комиссию).`,
        { replyMarkup: RM_Home(userLang) }
      );
      setState(userId, 0);
      return null;
    }

    if (config.requiresBalanceIn && config.externalFee) {
      const balanceExternal = await BalanceService.getBalance(userId, config.requiresBalanceIn);
      if (balanceExternal < config.externalFee) {
        await BotService.sendMessage(
          userId,
          `Недостаточно ${config.requiresBalanceIn.toUpperCase()} для оплаты комиссии (нужно ${config.externalFee}).`,
          { replyMarkup: RM_Home(userLang) }
        );
        setState(userId, 0);
        return null;
      }
    }

    return amount;
  }
}
