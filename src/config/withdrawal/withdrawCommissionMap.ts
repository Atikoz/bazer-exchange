import trimNumber from "../../utils/trimNumber";

export interface WithdrawalRule {
  fixedFee?: number;
  percentFee?: number;
  minFee?: number;
  requiresBalanceIn?: string;
  externalFee?: number;
  displayFee?: (amount: number) => string;
}

export const withdrawCommissionMap: Record<string, WithdrawalRule> = {
  usdt: { fixedFee: 2 },
  mpx: { fixedFee: 4 },
  xfi: { fixedFee: 0.5 },
  artery: {
    percentFee: 0.1,
    minFee: 1,
    displayFee: (amount) => {
      const fee = Math.max(amount * 0.1, 1);
      return `+ ${trimNumber(fee)} ARTERY`;
    }
  },
  bip: { fixedFee: 70, requiresBalanceIn: 'bip' },
  hub: { externalFee: 70, requiresBalanceIn: 'bip' },
  monsterhub: { externalFee: 70, requiresBalanceIn: 'bip' },
  bnb: { externalFee: 70, requiresBalanceIn: 'bip' },
  usdtbsc: { externalFee: 70, requiresBalanceIn: 'bip' },
  bipkakaxa: { externalFee: 70, requiresBalanceIn: 'bip' },
  cashbsc: { externalFee: 70, requiresBalanceIn: 'bip' },
  bazerhub: { externalFee: 70, requiresBalanceIn: 'bip' },
  ruble: { externalFee: 70, requiresBalanceIn: 'bip' },
  minterBazercoin: { externalFee: 70, requiresBalanceIn: 'bip' },
  '100cashbac': { externalFee: 70, requiresBalanceIn: 'bip' },
};
