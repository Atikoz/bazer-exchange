import 'dotenv/config';
import { connectToMongo } from '../db/connectToMongo';
import MailService from '../service/mail/serviceMail';
import UserProvisioningService from '../service/user/UserProvisioningService';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri)

    console.log(await MailService.sendMailPassword('wewefewfewfewf', 'vlasenkovadim2005@gmail.com')
    )
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();