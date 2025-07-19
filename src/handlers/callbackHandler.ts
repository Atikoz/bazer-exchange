import { Message } from "telebot";
import { handlerPatterns } from "./callbackHandlers/handlerPatterns";
import User from "../models/user/UserModel";

async function callbackHandler(msg: Message) {
  console.log(`пользователь ${msg.from.id} отправил колбек: ${msg.data}`);

  if (msg.from?.id) {
    await User.findOneAndUpdate({ id: msg.from.id }, {
      lastActivity: new Date(),
      isActive: true
    });
  }

  const callback = msg.data?.split('_')[0];

  const entry = handlerPatterns.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(callback))
  );

  if (entry) {
    await entry.handler(msg);
  }
}

export default callbackHandler;