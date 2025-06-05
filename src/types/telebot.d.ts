import 'telebot';


declare module 'telebot' {
  export interface Chat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }

  export interface Message {
    message_id: number;
    from: User;
    chat: Chat;
    date: number;
    text?: string;
    data?: string;
    [key: string]: any;
  }

  export interface CallbackQuery {
    id: string;
    from: User;
    data: string;
    message?: Message;
    inline_message_id?: string;
    chat_instance?: string;
  }

  type InlineButton = {
    callback?: string;
    url?: string;
    hide?: boolean;
  };
  
  type InlineKeyboard = InlineButton[][];
}