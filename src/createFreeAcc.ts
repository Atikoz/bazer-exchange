import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import { FreeAccountService } from './service/user/FreeAccountService';
import sleep from './function/sleepFunction';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);

    const countAcc = 1;

    for (let i = 1; i <= countAcc; i++) {
      const result = await FreeAccountService.createNew()
      console.log(`✅ Created acc status: ${result}`);
      await sleep(5000)
    }

  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();