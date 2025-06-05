import User from "../../models/user/UserModel";
import WalletUser from "../../models/user/WalletUser";
import BalanceUser from '../../models/user/BalanceModel';
import ProfitPool from "../../models/user/ProfitPoolModel";
import CrossfiService from "../blockchain/crossfi/crossfiService";
import BotService from "../telegram/BotService";
import EncryptionService from "../security/EncryptionService";
import Trc20Service from "../blockchain/trc20/Trc20Service";
import ArteryService from "../blockchain/artery/ateryService";
import MinterService from "../blockchain/minter/minterService";
import decimalService from "../blockchain/decimal/decimalService";
const crossfiService = new CrossfiService();
const Trc20 = new Trc20Service();
const minterService = new MinterService();


class AuthFallback {
  static async register(userId: number, email: string | null = null): Promise<{
    status: string;
    message: string;
    mnemonic: string;
  }> {
    try {
      const createDelWallet = decimalService.createWallet();
      if (!createDelWallet.status) {
        return this.register(userId);
      }

      const createUsdt = await Trc20.createWallet();
      const createCrossfi = await crossfiService.createWallet(createDelWallet.mnemonic);
      const createArtery = await ArteryService.createUserArteryWallet(createDelWallet.mnemonic);
      const createMinter = await minterService.createMinterWallet(createDelWallet.mnemonic);

      const encryptedMnemonic = EncryptionService.encryptSeed(createDelWallet.mnemonic);

      await User.create({ id: userId, mail: email });
      await ProfitPool.create({ id: userId });

      await WalletUser.create({
        id: userId,
        mnemonic: encryptedMnemonic,
        del: { address: createDelWallet.address },
        usdt: { address: createUsdt.address, privateKey: createUsdt.privateKey },
        crossfi: { address: createCrossfi.address },
        artery: { address: createArtery },
        minter: { address: createMinter.address, privateKey: createMinter.privateKey }
      });

      await BalanceUser.create({ id: userId });

      await BotService.sendLog(`Пользователь ${userId} зарегестрировался в боте. Добро пожаловать!`);

      return {
        status: 'ok',
        message: 'user registered successfully',
        mnemonic: encryptedMnemonic
      };
    } catch (error) {
      console.error(error);

      return {
        status: 'error',
        message: 'error Authentication function',
        mnemonic: ''
      };
    }
  }
}

export default AuthFallback;