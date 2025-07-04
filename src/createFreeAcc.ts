import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import BalanceUser from './models/user/BalanceModel';
import { FreeAccountService } from './service/user/FreeAccountService';
import sleep from './function/sleepFunction';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);

    const countAcc = 20;

    for (let i = 1; i < countAcc; i++) {
      const result = await FreeAccountService.createNew()
      console.log(`✅ Updated ${result} documents`);
      await sleep(5000)
    }

  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();