import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import CrossfiService from './service/blockchain/crossfi/crossfiService';
import WalletUser from './models/user/WalletUser';
import EncryptionService from './service/security/EncryptionService';
import BalanceUser from './models/user/BalanceModel';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);
    
    await BalanceUser.updateMany({$set: { 'main.100cashbac': 0, 'hold.100cashbac': 0}});

    console.log('updated data successfully')
  } catch (error) {
    console.error('updating data error :', error);
    process.exit(1);
  }

})();