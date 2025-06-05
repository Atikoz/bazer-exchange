export interface UserWallet {
  del: { address: string };
  usdt: { address: string; privateKey: string };
  crossfi: { address: string };
  artery: { address: string };
  minter: { address: string; privateKey: string };
}