import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import User from './models/user/UserModel';


const mongoUri = process.env.MONGO_URI as string;

async function registerUser(userId: number, email: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "email": email,
    "password": "qwerty22",
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

      const data = await registerUser(id, mail);

      const a = await User.updateOne(
        { id },
        { $set: { bazerId: data } }
      );

      console.log(a)

      count++
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