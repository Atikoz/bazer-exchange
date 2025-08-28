import { Request, Response } from 'express';
import BotService from '../../service/telegram/BotService';

interface SendMessageRequestBody {
  target: Target;
  text: string;
}

type Target = "users" | "admins";


const LIQUIDITY_LOG_CHANNEL_ID = process.env.LIQUIDITY_LOG_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;


const CHANNEL_MAP: Record<Target, string> = {
  users: LIQUIDITY_LOG_CHANNEL_ID,
  admins: LOG_CHANNEL_ID
};

export class MessageController {
  static async sendMessage(req: Request<{}, {}, SendMessageRequestBody>, res: Response): Promise<void> {
    try {
      const { target, text } = req.body;
      const channelId = CHANNEL_MAP[target];

      if (!channelId) {
        res.status(400).json({ status: 'error', error: 'Invalid target specified' });
        return;
      }

      await BotService.sendLog(
        text,
        channelId
      );

      res.status(200).json({ status: 'ok', error: null, message: `message send: ${text}` });

    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'error create order',
        message: error.message,
      });
    }
  }
}