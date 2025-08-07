import 'dotenv/config';
import { connectToMongo } from '../db/connectToMongo';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri)


    console.log('done')
    process.exit(1);
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();