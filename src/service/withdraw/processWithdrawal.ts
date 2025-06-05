import { defaultWithdrawalConfig, withdrawalConfigMap } from "../../config/withdrawal/coinWithdrawalMap";
import { withdrawCommissionMap } from "../../config/withdrawal/withdrawCommissionMap";
import BalanceService from "../balance/BalanceService";
import BotService from "../telegram/BotService";

interface ProcessWithdrawalParams {
  userId: number;
  amount: number;
  coin: string;
  address: string;
}

export async function processWithdrawal({
  userId,
  amount,
  coin,
  address
}: ProcessWithdrawalParams): Promise<void> {
  const config = withdrawalConfigMap[coin] || defaultWithdrawalConfig;
  const commissionCfg = withdrawCommissionMap[coin];

  if (!config || !config.handler) {
    throw new Error(`No withdrawal handler for coin: ${coin}`);
  }

  //Отправка транзакции
  const tx = await config.handler({ userId, coin, amount, address });
  if (!tx.success) {
    await BotService.sendMessage(userId, `Ошибка при выводе! Попробуйте позже или обратитесь в поддержку.`);
    return;
  };

  //Основная сумма списуется
  await BalanceService.updateBalance(userId, coin, -amount);

  //Комиссия
  if (config.fee === 'dynamic' && commissionCfg?.percentFee) {
    let fee = amount * commissionCfg.percentFee;
    if (commissionCfg.minFee) fee = Math.max(fee, commissionCfg.minFee);
    await BalanceService.updateBalance(userId, coin, -fee);
  } else if (config.extraFeeCoin && typeof config.fee === 'number') {
    await BalanceService.updateBalance(userId, config.extraFeeCoin, -config.fee);
  } else if (typeof config.fee === 'number') {
    await BalanceService.updateBalance(userId, coin, -config.fee);
  }

  const baseLog = `Пользователь ${userId} успешно вывел ${amount} ${coin.toUpperCase()}\nTxHash: <code>${tx.txHash}</code>`;
  const txMessage = `Вывод успешный ✅\nTxHash: <code>${tx.txHash}</code>\nОжидайте, средства поступят в течение нескольких минут.`;

  await BotService.sendMessage(userId, txMessage, { parseMode: "html" });
  await BotService.sendLog(baseLog);
}
