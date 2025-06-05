import { Message } from "telebot";
import { handlerPatterns } from "./callbackHandlers/handlerPatterns";

async function callbackHandler(msg: Message) {
  console.log(`пользователь ${msg.from.id} отправил колбек: ${msg.data}`);

  const callback = msg.data?.split('_')[0]
  
  const entry = handlerPatterns.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(callback))
  );

  if (entry) {
    await entry.handler(msg);
  }
}

export default callbackHandler;