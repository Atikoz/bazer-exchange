import { Message } from "telebot";
import { rangeState } from "./rangeStates";

async function mainStateHandler(msg: Message, state: number): Promise<void> {
  const handlerEntry = rangeState.find(({ range }) =>
    state >= range[0] && state <= range[1]
  );

  if (handlerEntry) {
    await handlerEntry.handler(msg, state);
  }
}

export default mainStateHandler;