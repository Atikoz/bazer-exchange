import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import BalanceUser from './models/user/BalanceModel';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);

    const result = await BalanceUser.updateMany(
      { 'main.bzr': { $exists: false } },
      { $set: { 'main.bzr': 0 } }
    );

    console.log(`✅ Updated ${result.modifiedCount} documents`);

  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();