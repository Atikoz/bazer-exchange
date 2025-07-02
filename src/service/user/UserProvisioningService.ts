import User from "../../models/user/UserModel";
import WalletUser from "../../models/user/WalletUser";
import BalanceUser from '../../models/user/BalanceModel';
import ProfitPool from "../../models/user/ProfitPoolModel";
import CrossfiService from "../blockchain/crossfi/crossfiService";
import BotService from "../telegram/BotService";
import EncryptionService from "../security/EncryptionService";
import Trc20Service from "../blockchain/trc20/Trc20Service";
import arteryService from "../blockchain/artery/ateryService";
import MinterService from "../blockchain/minter/minterService";
import decimalService from "../blockchain/decimal/decimalService";
import mongoose from "mongoose";
const crossfiService = new CrossfiService();
const Trc20 = new Trc20Service();
const minterService = new MinterService();


interface ResultCreateUserWithWallets {
  status: string;
  message: string;
  mnemonic: string;
}

class UserProvisioningService {
  static async createUserWithWallets(userId: number, email: string | null = null): Promise<ResultCreateUserWithWallets> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const createDelWallet = decimalService.createWallet();
      if (!createDelWallet.status) {
        return this.createUserWithWallets(userId);
      }

      const createUsdt = await Trc20.createWallet();
      const createCrossfi = await crossfiService.createWallet(createDelWallet.mnemonic);
      const createartery = await arteryService.createUserArteryWallet(createDelWallet.mnemonic);
      const createMinter = await minterService.createMinterWallet(createDelWallet.mnemonic);

      const encryptedMnemonic = EncryptionService.encryptSeed(createDelWallet.mnemonic);

      await User.create([{ id: userId, mail: email }], { session });
      await ProfitPool.create([{ id: userId }], { session });

      await WalletUser.create([{
        id: userId,
        mnemonic: encryptedMnemonic,
        del: { address: createDelWallet.address },
        usdt: { address: createUsdt.address, privateKey: createUsdt.privateKey },
        crossfi: { address: createCrossfi.address },
        artery: { address: createartery },
        minter: { address: createMinter.address, privateKey: createMinter.privateKey }
      }], { session });

      await BalanceUser.create([{ id: userId }], { session });

      await session.commitTransaction();
      session.endSession();

      await BotService.sendLog(`Пользовaтель ${userId} зaрегестрировaлся в боте. Добро пожaловaть!`);

      return {
        status: 'ok',
        message: 'user registered successfully',
        mnemonic: encryptedMnemonic
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.dir(session)

      console.error('Error create user with wallets:', error);

      return {
        status: 'error',
        message: 'error authentication function',
        mnemonic: ''
      };
    }
  }
}

export default UserProvisioningService;