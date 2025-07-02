import BotService from "../service/telegram/BotService";

export function sendError(userId: number, error: Error, errorDescription?: string): void {
  console.error(errorDescription, error);
  BotService.sendMessage(userId, 'Произошла ошибка, попробуйте попытку позже. В случае если ошибка останется, свяжитесь с администрацией.');
}