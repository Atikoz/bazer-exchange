import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import CrossfiService from './service/blockchain/crossfi/crossfiService';
import WalletUser from './models/user/WalletUser';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);

    const CrossfiServiceInst = new CrossfiService();

    const users = await WalletUser.find();

    for (const user of users) {
      const evmAddress = await CrossfiServiceInst.getEvmAddressFromCosmosAddress(user.crossfi.address);

      console.log(user.id)
      console.log(user.crossfi.address)
      console.log(evmAddress)

      const a = await WalletUser.updateOne(
        { id: user.id },
        { $set: { 'crossfi.evmAddress': evmAddress } }
      );

      console.log(a)
    }
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();