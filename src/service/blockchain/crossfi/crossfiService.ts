import { StargateClient, SigningStargateClient, GasPrice, calculateFee, DeliverTxResponse } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet, coin, decodeTxRaw } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
import { toBaseUnit } from '../../../utils/unitConversion';
import { ICrossfiTx, CrossfiTxData, CrossfiBalance, CrossfiAnswerApiGetBalance, CreateCrossfiWallet, ISendCrossfiCoin, CrossfiTxDecoded, CrossfiTxLog, ICrossfiEvmTx } from '../../../interface/CrossfiInterfaces';
import CrossfiUserReplenishment from '../../../models/crossfi/CrossfiUserReplenishment';
import EncryptionService from '../../security/EncryptionService';
import { Wallet } from 'ethers';

const CROSSFI_RPC_URL = process.env.CROSSFI_RPC_URL;
const CROSSFI_MAINNET_RPC = process.env.CROSSFI_MAINNET_RPC;
const BZR_CONTRACT_ADDRESS = process.env.BZR_CONTRACT_ADDRESS;

const minimalSum = {
  xfi: 3,
  mpx: 10
}

const GAS_PRICE = {
  mpx: GasPrice.fromString('10000000000000mpx'),
  xfi: GasPrice.fromString('100000000000xfi'),
};

class CrossfiService {
  private readonly rpcUrl: string;
  private client: StargateClient
  private getRequestOptions: RequestInit = {
    method: "GET",
    redirect: "follow" as RequestRedirect
  }

  constructor() {
    this.rpcUrl = CROSSFI_RPC_URL;
    this.client = null;
  }

  protected async initialize(): Promise<void> {
    try {
      this.client = await StargateClient.connect(this.rpcUrl);
    } catch (error) {
      console.error('initialize rpc connection error:', error)
    }
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.client) {
      await this.initialize();
    }
  }

  protected async getUserTx(address: string, evm: boolean = false): Promise<ICrossfiTx[] | ICrossfiEvmTx[]> {
    try {
      await this.ensureInitialized();

      if (evm) {
        const response = await fetch(`https://xfiscan.com/api/1.0/txs?limit=100&existsEVM=true&address=${address}&page=1`, this.getRequestOptions);
        const data = await response.json();
        return data.docs as ICrossfiEvmTx[];
      }

      const sentTransactions = await this.client.searchTx([
        { key: "message.sender", value: address }
      ]);

      const receivedTransactions = await this.client.searchTx([
        { key: "transfer.recipient", value: address }
      ]);

      const allTransactions = [...sentTransactions, ...receivedTransactions];

      return allTransactions as ICrossfiTx[];
    } catch (error) {
      console.error('error getUserTx crossfi', error);
      return []
    }
  }

  // async getBalanceEvmAddress(address: string) {
  //   try {
  //     // Підключаємося до EVM
  //     const provider = new ethers.JsonRpcProvider(EVM_RPC_URL);

  //     // ✅ 1. Отримуємо нативний баланс (XFI)
  //     const nativeRaw = await provider.getBalance(address);
  //     const nativeFormatted = ethers.formatEther(nativeRaw); // у XFI

  //     // ✅ 2. Підключаємо контракт токена BZR
  //     const tokenContract = new ethers.Contract(BZR_CONTRACT_ADDRESS, ERC20_ABI, provider);

  //     const [tokenRaw, decimals, symbol] = await Promise.all([
  //       tokenContract.balanceOf(address),
  //       tokenContract.decimals(),
  //       tokenContract.symbol(),
  //     ]);
  //     const tokenFormatted = ethers.formatUnits(tokenRaw, decimals);

  //     return {
  //       address,
  //       native: {
  //         balance: nativeFormatted,
  //         symbol: "XFI",
  //       },
  //       token: {
  //         balance: tokenFormatted,
  //         symbol,
  //       },
  //     };
  //   } catch (error) {
  //     console.error(`getBalanceEvmAddress error for ${address}:`, error);
  //     return null;
  //   }
  // }

  protected async checkTxHash(hash: string): Promise<CrossfiTxData | null> {
    try {
      const response = await fetch(`${this.rpcUrl}/tx?hash=0x${hash}&prove=true`, this.getRequestOptions)

      if (!response.ok) {
        throw new Error(`HTTP checkTxHash crossfi error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data.result

    } catch (error) {
      console.error(`error cheking crossfi tx: `, error);

      return null
    }
  }

  protected async getBalance(address: string): Promise<CrossfiBalance> {
    try {
      const response = await fetch(`https://cosmos-api.mainnet.ms/cosmos/bank/v1beta1/balances/${address}`, this.getRequestOptions);

      const resultApi: CrossfiAnswerApiGetBalance = await response.json();

      const result = {
        status: true,
        mpx: 0,
        xfi: 0
      };

      const coins = resultApi.balances;

      coins.forEach(coin => {
        if (coin.denom === "mpx") {
          result.mpx = +coin.amount || 0;
        } else if (coin.denom === "xfi") {
          result.xfi = +coin.amount || 0;
        }
      });

      return result
    } catch (error) {
      console.error('checkBalance crossfi error:', error);

      return {
        status: false,
        mpx: 0,
        xfi: 0
      }
    }
  }

  async createWallet(mnemonic: string): Promise<CreateCrossfiWallet> {
    try {
      const HD_PATHS = [stringToPath("m/44'/118'/0'/0/0"), stringToPath("m/44'/60'/0'/0/0")];

      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "mx",
        hdPaths: HD_PATHS,
      });

      const [oldAddressAccountData, newAddressAccountData] = await wallet.getAccounts();

      console.log('------------------');
      console.log('old address:', oldAddressAccountData.address);
      console.log('new address:', newAddressAccountData.address);
      console.log('------------------');

      const evmAddress = await this.getEvmAddressFromCosmosAddress(mnemonic);

      return {
        status: true,
        address: newAddressAccountData.address,
        evmAddress
      }
    } catch (error) {
      console.error('error create crossfi wallet:', error);
      return {
        status: false
      }
    }
  }

  protected async calculateFeeTx(recipient: string, mnemonic: string, denom: string, amountToSend: number): Promise<number> {
    const GAS_PRICE = {
      mpx: GasPrice.fromString('10000000000000mpx'),
      xfi: GasPrice.fromString('100000000000xfi'),
    };

    let gasPrice = GAS_PRICE[denom];

    const clientOptions = {
      gasPrice,
      broadcastTimeoutMs: 5000,
      broadcastPollIntervalMs: 1000,
    };

    const PREFIX = 'mx';
    const HD_PATHS = [stringToPath("m/44'/118'/0'/0/0"), stringToPath("m/44'/60'/0'/0/0")];

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,
      {
        prefix: PREFIX,
        hdPaths: HD_PATHS
      });

    const signingClient = await SigningStargateClient.connectWithSigner(this.rpcUrl, signer, clientOptions);

    const [oldAddressAccountData, newAddressAccountData] = await signer.getAccounts();

    const message = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: newAddressAccountData.address,
        toAddress: recipient,
        amount: [coin(toBaseUnit(amountToSend), denom)],
      },
    };


    const gasEstimate = await signingClient.simulate(newAddressAccountData.address, [message], '');
    const gasLimit = Math.round(gasEstimate * 1.4);
    const stdFee = calculateFee(gasLimit, gasPrice);

    return +stdFee.amount[0].amount / 1e18
  }

  async sendCoin(recipient: string, mnemonic: string, denom: string, amountToSend: number): Promise<ISendCrossfiCoin> {
    try {
      let gasPrice = GAS_PRICE[denom];

      const clientOptions = {
        gasPrice,
        broadcastTimeoutMs: 20000,
        broadcastPollIntervalMs: 1000,
      };

      const PREFIX = 'mx';
      const HD_PATHS = [stringToPath("m/44'/118'/0'/0/0"), stringToPath("m/44'/60'/0'/0/0")];

      const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,
        {
          prefix: PREFIX,
          hdPaths: HD_PATHS
        });

      const signingClient = await SigningStargateClient.connectWithSigner(this.rpcUrl, signer, clientOptions);

      const [oldAddressAccountData, newAddressAccountData] = await signer.getAccounts();

      console.log('old address:', oldAddressAccountData.address);
      console.log('new address:', newAddressAccountData.address);

      const message = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: newAddressAccountData.address,
          toAddress: recipient,
          amount: [coin(toBaseUnit(amountToSend), denom)],
        },
      };

      const gasEstimate = await signingClient.simulate(newAddressAccountData.address, [message], '');
      const gasLimit = Math.round(gasEstimate * 1.4);
      const stdFee = calculateFee(gasLimit, gasPrice);
      console.log('stdFee', stdFee);

      const tx = await signingClient.signAndBroadcast(newAddressAccountData.address, [message], stdFee, 'Перевод бота BAZER EXCHANGE: https://t.me/bazerp2p_bot');
      console.log('tx', tx);

      return {
        status: true,
        tx: tx
      }
    } catch (error) {
      console.error('error send function crossfi: ', error);

      if (error.name === 'TimeoutError') {
        return {
          status: true,
          msg: 'TimeoutError' + error.message,
          tx: null
        }
      }

      return {
        status: false,
        msg: error.message,
        tx: null
      }
    }
  }

  protected getTxData(rawLog: string): CrossfiTxDecoded {
    const parsedLogs: CrossfiTxLog[] = JSON.parse(rawLog);

    const coinSpent = parsedLogs[0].events.find((item) => item.type === 'coin_spent');
    const transfer = parsedLogs[0].events.find((item) => item.type === 'transfer');

    const amountArr = transfer.attributes.filter((item) => item.key === 'amount')
    const [amount, coin] = amountArr[0].value.split(/(?<=\d)(?=\D)/);

    const sender = coinSpent.attributes[0].value;

    return {
      sender,
      amount,
      coin
    }
  }

  protected async validateTx(userWallet: string, hash: string, sender: string, amount: number, coin: string): Promise<boolean> {
    amount = amount / 1e18;

    try {
      const isTransaction = await CrossfiUserReplenishment.findOne({ hash: hash });

      if (isTransaction) {
        throw new Error('transaction is in the database')
      }

      if (userWallet === sender) {
        throw new Error('transfer transaction to admin wallet')
      }

      if (amount < minimalSum[coin]) {
        throw new Error('replenishment less than the minimum amount')
      }

      if (!(coin === 'mpx' || coin === 'xfi')) {
        throw new Error('unavailable coins')
      }

      return true
    } catch (error) {
      return false
    }
  }

  async withdrawCoins(address: string, coin: 'mpx' | 'xfi', amount: number): Promise<null | DeliverTxResponse> {
    try {
      const result = await this.sendCoin(address, process.env.MNEMONIC, coin, amount);

      if (!result.status) {
        throw new Error(result.msg)
      }

      return result.tx
    } catch (error) {
      console.error('error withdraw coins crossfi:', error);
      return null
    }
  }

  async getEvmAddressFromCosmosAddress(mnemonic: string): Promise<string> {
    const wallet = Wallet.fromMnemonic(mnemonic);

    return wallet.address;
  }
}

export default CrossfiService;