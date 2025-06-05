// config/withdrawalConfig.ts
export interface WithdrawalConfig {
  feeText: string;
  minKey: string;
  state: number;
}

export const withdrawalConfigs: Record<string, WithdrawalConfig> = {
  usdt: {
    feeText: 'Комиссия вывода составляет 2 USDT!',
    minKey: 'usdt',
    state: 20,
  },
  mpx: {
    feeText: 'Комиссия вывода составляет 4 MPX!',
    minKey: 'mpx',
    state: 20,
  },
  xfi: {
    feeText: 'Комиссия вывода составляет 0.5 XFI!',
    minKey: 'xfi',
    state: 20,
  },
  artery: {
    feeText: 'Комиссия вывода составляет 1% от суммы вывода!',
    minKey: 'artery',
    state: 20,
  },
  bip: {
    feeText: 'Комиссия составляет 180 BIP!',
    minKey: 'bip',
    state: 20,
  },
  hub: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'hub', state: 20 },
  monsterhub: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'monsterhub', state: 20 },
  bnb: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'bnb', state: 20 },
  usdtbsc: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'usdtbsc', state: 20 },
  bipkakaxa: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'bipkakaxa', state: 20 },
  cashbsc: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'cashbsc', state: 20 },
  bazerhub: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'bazerhub', state: 20 },
  ruble: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'ruble', state: 20 },
  minterBazercoin: { feeText: 'Комиссия составляет 180 BIP!', minKey: 'minterBazercoin', state: 20 },
};
