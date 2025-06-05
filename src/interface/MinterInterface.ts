export interface ISendMinter {
  status: boolean,
  hash: string,
  error: string | null
}

export interface ITxDataMinter {
  hash: string,
  code: string,
  gas_coin: {
    id: string,
    symbol: string
  },
  data: {
    coin: {
      id: string,
      symbol: string
    },
    to: string,
    value: string
  }
}

interface CoinInfo {
  id: number;
  symbol: string;
}

export interface SingleSendData {
  coin: CoinInfo;
  to: string;
  value: string;
}

export interface TransactionBase {
  hash: string;
  height: number;
  timestamp: string;
  payload: string;
  from: string;
}

export interface TransactionSingle extends TransactionBase {
  type: 1;
  data: SingleSendData;
}

export interface TransactionMultiSend extends TransactionBase {
  type: 13;
  data: {
    list: SingleSendData[];
  };
}

export type MinterTransaction = TransactionSingle | TransactionMultiSend;

interface DataExchangeMinter {
  hash: string
}

export interface IExchangeMinter {
  status: boolean,
  data?: DataExchangeMinter,
  message?: string
}

export interface ItemBalanceMinter {
  coin: {
    id: string,
    symbol: string
  },
  value: string,
  bip_value: string
}

export interface ICreateMinterWallet {
  address: string,
  privateKey: string
}