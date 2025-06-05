import { DeliverTxResponse } from "@cosmjs/stargate";

export interface CreateCrossfiWallet {
  status: boolean,
  address: string
}

export interface CrossfiBalance {
  status: boolean,
  mpx: number,
  xfi: number
}

export interface CrossfiAccountBalance {
  denom: string;
  amount: string;
}

export interface CrossfiAnswerApiGetBalance {
  balances: CrossfiAccountBalance[];
}

export interface ICrossfiTx {
  hash: string,
  code: number,
  rawLog: string
}

export interface CrossfiTxData {
  hash: string,
  index: number,

  tx_result: {
    code: number,
    log: string
  }
}

export interface ISendCrossfiCoin {
  status: boolean,
  msg?: string,
  tx: DeliverTxResponse | null
}

export interface CrossfiTxDecoded {
  sender: string;
  amount: string;
  coin: string;
}

interface TxAttribute {
  key: string;
  value: string;
}

interface TxEvent {
  type: string;
  attributes: TxAttribute[];
}

export interface CrossfiTxLog {
  msg_index: number;
  events: TxEvent[];
}

export interface CrossfiSendAdminTx {
  id: number,
  hash: string,
  coin: string,
  amount: number,
  status: string
}
