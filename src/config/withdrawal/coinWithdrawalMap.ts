import CrossfiService from "../../service/blockchain/crossfi/crossfiService";
import Trc20Service from "../../service/blockchain/trc20/Trc20Service";
import ArteryService from "../../service/blockchain/artery/ateryService";
import MinterService from "../../service/blockchain/minter/minterService";
import decimalService from "../../service/blockchain/decimal/decimalService";
import { MINTER_COINS_WITH_BIP_FEE } from "../../utils/constans";

const CrossfiServiceInstance = new CrossfiService();
const Trc20ServiceInstance = new Trc20Service();
const MinterServiceInstance = new MinterService();

type WithdrawalHandler = (params: {
  userId: number;
  amount: number;
  address: string;
  coin: string;
}) => Promise<{ success: boolean; txHash?: string; error?: string }>;

interface CoinWithdrawalConfig {
  handler: WithdrawalHandler;
  fee?: number | string;
  extraFeeCoin?: string;
}


export const withdrawalConfigMap: Record<string, CoinWithdrawalConfig> = {
  usdt: {
    handler: async ({ address, amount }) => {
      const tx = await Trc20ServiceInstance.withdrawCoins(address, amount);
      return tx.status ? { success: true, txHash: tx.hash } : { success: false };
    },
    fee: 2
  },
  mpx: {
    handler: async ({ address, amount }) => {
      const tx = await CrossfiServiceInstance.withdrawCoins(address, 'mpx', amount);
      return tx ? { success: true, txHash: tx.transactionHash } : { success: false };
    },
    fee: 4
  },
  xfi: {
    handler: async ({ address, amount }) => {
      const tx = await CrossfiServiceInstance.withdrawCoins(address, 'xfi', amount);
      return tx ? { success: true, txHash: tx.transactionHash } : { success: false };
    },
    fee: 0.5
  },
  artery: {
    handler: async ({ address, amount }) => {
      const tx = await ArteryService.withdrawCoins(address, amount);
      return tx ? { success: true, txHash: tx.txhash } : { success: false };
    },
    fee: 'dynamic' // розраховується окремо
  },
  minterBazercoin: {
    handler: async ({ address, amount }) => {
      const tx = await MinterServiceInstance.withdrawCoins(address, amount, 'bazercoin');
      return tx ? { success: true, txHash: tx } : { success: false };
    },
    extraFeeCoin: 'bip',
    fee: 180
  },
  bip: {
    handler: async ({ address, amount }) => {
      const tx = await MinterServiceInstance.withdrawCoins(address, amount, 'bip');
      return tx ? { success: true, txHash: tx } : { success: false };
    },
    fee: 180
  },
  ...Object.fromEntries(MINTER_COINS_WITH_BIP_FEE.map((coin) => [
    coin,
    {
      handler: async ({ address, amount }) => {
        const tx = await MinterServiceInstance.withdrawCoins(address, amount, coin);
        return tx ? { success: true, txHash: tx } : { success: false };
      },
      extraFeeCoin: 'bip',
      fee: 180
    }
  ]))
};

// інші монети делегуються в Decimal:
export const defaultWithdrawalConfig: CoinWithdrawalConfig = {
  handler: async ({ address, amount, coin }) => {
    const tx = await decimalService.withdrawCoins(address, coin, amount);
    const txHash = tx?.result?.tx_response?.txhash;
    return txHash ? { success: true, txHash } : { success: false };
  }
};
