import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import User from './models/user/UserModel';
import { generatePassword } from './utils/generatePassword';
import MailService from './service/mail/serviceMail';


const mongoUri = process.env.MONGO_URI as string;

async function registerUser(userId: number, email: string, password: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "email": email,
    "password": password,
    "telegramId": userId,
    "referId": "bzr92c1frq6t1tv"
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch("https://auth.bazerwallet.com/auth/register", requestOptions);
  const data = await response.json();

  return data
}


async function createBazerId() {
  try {
    const users = await User.find({ mail: { $ne: null } });
    let count = 0;

    for (const user of users) {
      const { id, mail } = user;
      const password = generatePassword();

      const data = await registerUser(id, mail, password);
      const status = data.status;

      if (status === 'success') {
        const bazerId = data.data.id;
        const a = await User.updateOne(
          { id },
          { $set: { bazerId } }
        );

        await MailService.sendMailPassword(password, mail)

        console.log(bazerId)
        console.log(a)

        count++
      }
    }

    console.log(`updated ${count} bazerId`)

  } catch (error) {
    console.error(error)
  }
}

(async () => {
  try {
    await connectToMongo(mongoUri);

    // const resultCreateStatusActivity = await User.updateMany(
    //   {
    //     $or: [
    //       { lastActivity: { $exists: false } },
    //       { isActive: { $exists: false } }
    //     ]
    //   },
    //   {
    //     $set: {
    //       lastActivity: new Date(),
    //       isActive: true
    //     }
    //   }
    // );

    // console.log(`🔧 Оновлено ${resultCreateStatusActivity.modifiedCount} користувачів`);

    // const result = await User.updateMany(
    //   {
    //     $or: [
    //       { accessToken: { $exists: false } },
    //       { refreshToken: { $exists: false } }
    //     ]
    //   },
    //   {
    //     $set: {
    //       accessToken: null,
    //       refreshToken: null
    //     }
    //   }
    // );

    // console.log(`🔧 Оновлено ${result.modifiedCount} користувачів (access/refresh tokens)`);

    await createBazerId()
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();