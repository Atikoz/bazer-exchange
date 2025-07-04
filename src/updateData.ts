import 'dotenv/config';
import { connectToMongo } from './db/connectToMongo';
import User from './models/user/UserModel';


const mongoUri = process.env.MONGO_URI as string;

(async () => {
  try {
    await connectToMongo(mongoUri);

    const resultCreateStatusActivity = await User.updateMany(
      {
        $or: [
          { lastActivity: { $exists: false } },
          { isActive: { $exists: false } }
        ]
      },
      {
        $set: {
          lastActivity: new Date(),
          isActive: true
        }
      }
    );

    console.log(`🔧 Оновлено ${resultCreateStatusActivity.modifiedCount} користувачів`);

    const result = await User.updateMany(
      {
        $or: [
          { accessToken: { $exists: false } },
          { refreshToken: { $exists: false } }
        ]
      },
      {
        $set: {
          accessToken: null,
          refreshToken: null
        }
      }
    );

    console.log(`🔧 Оновлено ${result.modifiedCount} користувачів (access/refresh tokens)`);

  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

})();