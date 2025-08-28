import 'dotenv/config';
import { connectToMongo } from '../db/connectToMongo';
import RewardMinterServise from '../service/blockchain/minter/rewardMinterService';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri)
    console.log('TEST START')

    const result = await RewardMinterServise.getTxRewards100CASHBAC();

    console.dir(result, { depth: null });
    console.log(result.length)

    console.log('TEST DONE')
  } catch (error) {
    console.error('MongoDB connection error :', error);
  } finally {
    process.exit(1);
  }

})();