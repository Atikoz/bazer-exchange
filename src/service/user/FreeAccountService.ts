import FreeAccount from "../../models/user/FreeAccountModel";
import CrossfiService from "../blockchain/crossfi/crossfiService";
import EncryptionService from "../security/EncryptionService";
const crossfiService = new CrossfiService();

export class FreeAccountService {
  static async getFreeAccount() {
    return FreeAccount.findOne({ busy: false }).lean();
  }

  static async markAsBusy(mnemonic: string): Promise<void> {
    await FreeAccount.updateOne(
      { mnemonic },
      { $set: { busy: true } }
    );
  }

  static async delete(mnemonic: string): Promise<void> {
    await FreeAccount.deleteOne({ mnemonic });
  }

  static async createNew(): Promise<boolean> {
    try {
      const createDelWallet = await createDecimalWallet();

      if (!createDelWallet.status) {
        return await this.createNew();
      }

      const createUsdt = await Trc20.createWallet();
      const createCrossfi = await crossfiService.createWallet(createDelWallet.mnemonic);
      const createArtery = await createUserArteryWallet(createDelWallet.mnemonic);
      const createMinter = createMinterWallet(createDelWallet.mnemonic);

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
        crossfi: { address: createCrossfi.address },
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
