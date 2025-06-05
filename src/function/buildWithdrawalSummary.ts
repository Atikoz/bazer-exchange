import { withdrawCommissionMap } from "../config/withdrawal/withdrawCommissionMap";

function buildWithdrawalSummary(coin: string, amount: number): string {
  const config = withdrawCommissionMap[coin];
  const coinUpper = coin.toUpperCase();

  if (!config) return `${amount} ${coinUpper}`;

  if (config.displayFee) {
    return `${amount} ${coinUpper} ${config.displayFee(amount)}`;
  }

  if (config.fixedFee) {
    return `${amount + config.fixedFee} ${coinUpper}`;
  }

  if (config.externalFee && config.requiresBalanceIn) {
    return `${amount} ${coinUpper} + ${config.externalFee} ${config.requiresBalanceIn.toUpperCase()}`;
  }

  return `${amount} ${coinUpper}`;
}

export default buildWithdrawalSummary
