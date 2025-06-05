export interface ISendCoinsArtery {
  code: number;
  txhash: string;
}

export interface IAdminTransactionArtery {
  id: string,
  hash: string,
  amount: number,
  amountCommission: number,
  status: string
}