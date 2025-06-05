import { UserWallet } from "../../interface/UserWallet";

export const coinToWalletMap: Record<string, keyof UserWallet> = {
  usdt: 'usdt',
  artery: 'artery',
  mpx: 'crossfi',
  xfi: 'crossfi',
  bip: 'minter',
  hub: 'minter',
  monsterhub: 'minter',
  bnb: 'minter',
  usdtbsc: 'minter',
  bipkakaxa: 'minter',
  cashbsc: 'minter',
  minterBazercoin: 'minter',
  bazerhub: 'minter',
  ruble: 'minter',
};

export const defaultWalletKey: keyof UserWallet = 'del';