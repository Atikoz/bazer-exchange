import { Socket } from "socket.io";
import ChatMessage from "../../../../models/ws/ChatMessage";

interface FetchChatHistoryPayload {
  socketId: string;
}


const fetchChatHistoryHandler = async (socket: Socket, { socketId }: FetchChatHistoryPayload) => {
  try {
    const chat = await ChatMessage.findOne({ socketId });

    socket.emit("CHAT_HISTORY", chat?.messages || []);
  } catch (error) {
    console.error(`error sending chat history`, error);
    socket.emit('ERROR', { message: `Error fetching chat history: `, error });
  }
};

export default fetchChatHistoryHandler