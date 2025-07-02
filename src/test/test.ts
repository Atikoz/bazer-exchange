import 'dotenv/config';
import { connectToMongo } from '../db/connectToMongo';
import { UserRegistrationService } from '../service/user/UserRegistrationService';
import UserProvisioningService from '../service/user/UserProvisioningService';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri)

    console.log(await UserRegistrationService.registerUser(9994, 'test@mail.com')
    )
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();