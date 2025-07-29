import 'dotenv/config';
import { connectToMongo } from '../db/connectToMongo';
import CrossfiService from '../service/blockchain/crossfi/crossfiService';
import WalletUser from '../models/user/WalletUser';
import BalanceService from '../service/balance/BalanceService';
import { RewardDistributorService } from '../service/blockchain/crossfi/RewardDistributorService';



const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri)

    const RewardDistributorServiceInst = new RewardDistributorService();

    const a = await RewardDistributorServiceInst.distributeRewards();

    console.log('done')
    process.exit(1);
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();