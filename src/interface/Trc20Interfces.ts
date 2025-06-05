export interface CreateWalletTrc20 {
  address: string,
  privateKey: string
}

export interface UserBalanceTrc20 {
  balanceTron: number,
  balanceUsdt: number
}

export interface TransactionEnergyInfoTrc20 {
  status: boolean,
  energyUsed: number,
  energyFee: number
}

export interface AccountResourcesTrc20 {
  freeNetLimit: number,
  TotalNetLimit: number,
  TotalNetWeight: number,
  TotalEnergyLimit: number,
  TotalEnergyWeight: number
}

export interface CheckTransactionTrc20 {
  status: string,
  fee?: number,
}

export interface TransactionItemTrc20 {
  hash: string,
  coin: string,
  status: string,
  sender: string,
  amount: number,
}

export interface WithdrawCoinsTrc20 {
  status: boolean,
  hash: string
}

export interface ReplenishmentTrc20 {
  id: number;
  hash: string;
  coin: string;
  amount: number;
  status: string;
}