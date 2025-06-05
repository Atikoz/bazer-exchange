import TeleBot from "telebot";

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const APP_ENV = process.env.APP_ENV

class BotService {
  private readonly bot: TeleBot = new TeleBot(BOT_TOKEN);

  async sendMessage(id: number | string, text: string, options: any = { parseMode: 'html' }) {
    this.bot.sendMessage(id, text, options).catch((e) => console.log(`error sending message: ${e}`));
  }

  async sendLog(text: string) {
    const LOG_CHANNEL = process.env.LOG_CHANNEL_ID;

    if (APP_ENV === 'prod') {
      await this.sendMessage(LOG_CHANNEL, text);
    }

    console.log(text);
  }

  async getChatMember(chatId: string, userId: number) {
    const chatMemberInfo = await this.bot.getChatMember(chatId, userId).catch((e) => { console.log('channel', chatId, 'error', e) });

    return chatMemberInfo
  }

  deleteMessage(chatId: number, messageId: number) {
    return this.bot.deleteMessage(chatId, messageId);
  }

  editMessageText(params: { chatId: number; messageId: number }, text: string, options?: any) {
    return this.bot.editMessageText(params, text, options);
  }
}

export default new BotService