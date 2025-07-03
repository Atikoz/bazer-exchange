import 'dotenv/config';
import { textHandler } from './handlers/mainTextHandler';
import { bot } from './bot';
import callbackHandler from './handlers/callbackHandler';
import { connectToMongo } from './db/connectToMongo';

const mongoUri = process.env.MONGO_URI as string;


(async () => {
  await connectToMongo(mongoUri)

  bot.on('text', (msg) => textHandler(msg));
  bot.on('callbackQuery', (msg) => callbackHandler(msg));

  bot.start();
})();
