import mongoose from 'mongoose';
import 'dotenv/config';
import { textHandler } from './handlers/mainTextHandler';
import { bot } from './bot';
import callbackHandler from './handlers/callbackHandler';
// import { handleCallback } from './handlers/callbackHandler.ts';

const mongoUri = process.env.MONGO_URI as string;


(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected ✅');
  } catch (error) {
    console.error('MongoDB connection error :', error);
    process.exit(1);
  }

  bot.on('text', (msg) => textHandler(msg));
  bot.on('callbackQuery', (msg) => callbackHandler(msg));

  bot.start();
})();
