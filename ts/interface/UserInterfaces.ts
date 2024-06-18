export interface IUserWallets {
  id: number,
  mnemonics: string,
  del: {
    address: string,
    mnemonics: string,
  },
  usdt: {
    address: string,
    privateKey: string
  },
  minePlex: {
    address: string,
    sk: string,
    pk: string
  },
  mpxXfi: {
    address: string
  },
  artery: {
    address: string
  },
  minter: {
    address: string,
    privateKey: string
  }
}

