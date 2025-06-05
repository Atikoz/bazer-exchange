import { Server, Socket } from "socket.io";
import ChatMessage from "../../../../models/ws/ChatMessage";

interface SendMessagePayload {
  socketId: string;
  senderId: string;
  message: string;
}

const sendMessageHandler = async (socket: Socket, io: Server, { socketId, senderId, message }: SendMessagePayload): Promise<void> => {
  if (!message.trim()) {
    return
  }; // Перевірка на пусте повідомлення
  try {
    const chat = await ChatMessage.findOneAndUpdate(
      { socketId },
      { $push: { messages: { senderId, message } } },
      { new: true, upsert: true }
    );


    // Відправляємо повідомлення всім у кімнаті
    io.to(socketId).emit('NEW_MESSAGE', chat.messages.at(-1));

    console.log(`Message sent to order ${socketId}:`, chat.messages.at(-1));
  } catch (error) {
    console.error(`Error sending message ${socketId}: `, error);
    socket.emit('ERROR', { message: `Error sending message: ${error.message}` });
  }
};

export default sendMessageHandler;