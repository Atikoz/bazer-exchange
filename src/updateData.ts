import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import CrossfiService from './service/blockchain/crossfi/crossfiService';
import WalletUser from './models/user/WalletUser';
import FreeAccount from './models/user/FreeAccountModel';
import { Wallet } from "ethers";
import EncryptionService from './service/security/EncryptionService';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);

    const CrossfiServiceInst = new CrossfiService();

    const users = await WalletUser.find();

    for (const user of users) {
      const decryptedMnemonic = EncryptionService.decryptSeed(user.mnemonic);
      console.log('mnemonic:', decryptedMnemonic);
      const evmAddress = await CrossfiServiceInst.getEvmAddressFromCosmosAddress(decryptedMnemonic);

      console.log(user.id)
      console.log(user.crossfi.address)
      console.log(evmAddress)

      const a = await WalletUser.updateOne(
        { id: user.id },
        { $set: { 'crossfi.evmAddress': evmAddress } }
      );

      console.log(a)
    }

    const freeAccount = await FreeAccount.find();

    for (const acc of freeAccount) {
    const decryptedMnemonic = EncryptionService.decryptSeed(acc.mnemonic);
    console.log('mnemonic:', decryptedMnemonic);
    const evmAddress = await CrossfiServiceInst.getEvmAddressFromCosmosAddress(decryptedMnemonic);

      console.log(acc.crossfi.address)
      console.log(evmAddress)

      const a = await FreeAccount.updateOne(
        { mnemonic: acc.mnemonic },
        { $set: { 'crossfi.evmAddress': evmAddress } }
      );

      console.log(a)
    }
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();