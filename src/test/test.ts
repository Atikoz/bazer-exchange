import 'dotenv/config';
import { connectToMongo } from '../db/connectToMongo';
import FreeAccount from '../models/user/FreeAccountModel';
import WalletUser from '../models/user/WalletUser';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri)

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const walletArray = [];

    // const freeAcc = await FreeAccount.find();
    const freeAcc = await WalletUser.find();

    for (const acc of freeAcc) {
      const responce = await fetch(`http://45.88.104.44:1317/artery/profile/v1beta1/get_by_addr/${acc.artery.address}`, requestOptions)
      const data = await responce.json();

      if (data.hasOwnProperty('code')) {
        console.log(`acc = ${acc.artery.address} - not found, code: ${data.code}`);
        walletArray.push(acc.artery.address)
      }
    }

    console.log(walletArray)


    console.log('done')
    process.exit(1);
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();