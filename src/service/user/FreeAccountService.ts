import FreeAccount from "../../models/user/FreeAccountModel";
import CrossfiService from "../blockchain/crossfi/crossfiService";
import decimalService from "../blockchain/decimal/decimalService";
import Trc20Service from "../blockchain/trc20/Trc20Service";
import EncryptionService from "../security/EncryptionService";
import ArteryService from "../blockchain/artery/ateryService";
import MinterService from "../blockchain/minter/minterService";
import { ClientSession } from "mongoose";
const CrossfiServiceInstance = new CrossfiService();
const Trc20ServiceInstance = new Trc20Service();
const MinterServiceInstance = new MinterService();


export class FreeAccountService {
  static async getFreeAccount() {
    return FreeAccount.findOne({ busy: false }).lean();
  }

  static async markAsBusy(mnemonic: string, session?: ClientSession): Promise<void> {
    await FreeAccount.updateOne(
      { mnemonic },
      { $set: { busy: true } },
      { session }
    );
  }

  static async delete(mnemonic: string, session?: ClientSession): Promise<void> {
    await FreeAccount.deleteOne({ mnemonic }, { session });
  }

  static async createNew(): Promise<boolean> {
    try {
      const createDelWallet = await decimalService.createWallet();

      if (!createDelWallet.status) {
        return await this.createNew();
      }

      const createUsdt = await Trc20ServiceInstance.createWallet();
      const createCrossfi = await CrossfiServiceInstance.createWallet(createDelWallet.mnemonic);
      const createArtery = await ArteryService.createUserArteryWallet(createDelWallet.mnemonic);
      const createMinter = await MinterServiceInstance.createMinterWallet(createDelWallet.mnemonic);

      if (!createCrossfi.status) {
        return false
      }

      const encryptedMnemonic = EncryptionService.encryptSeed(createDelWallet.mnemonic);

      await FreeAccount.create({
        busy: false,
        mnemonic: encryptedMnemonic,
        del: { address: createDelWallet.address },
        usdt: {
          address: createUsdt.address,
          privateKey: createUsdt.privateKey
        },
        crossfi: { address: createCrossfi.address, evmAddress: createCrossfi.evmAddress },
        artery: { address: createArtery },
        minter: {
          address: createMinter.address,
          privateKey: createMinter.privateKey
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Error in createNewAcc:', error);
      return false;
    }
  }
} 
