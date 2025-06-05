import { Server } from "socket.io";
import handleJoinOrder from "./handlers/order/handleJoinOrder";
import updateOrderHandler from "./handlers/order/updateOrderHandler";
import sendMessageHandler from "./handlers/chat/sendMessageHandler";
import fetchChatHistoryHandler from "./handlers/chat/fetchChatHistoryHandler";

export default (io: Server) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    try {
    socket.on('JOIN_THE_DEAL', async (data) => {
      await handleJoinOrder(socket, data)
    });

    socket.on('UPDATE_ORDER', async (data) => {
      await updateOrderHandler(socket, io, data)
    });

    socket.on('SEND_MESSAGE', async (data) => {
      await sendMessageHandler(socket, io, data)
    });

    socket.on('FETCH_CHAT_HISTORY', async (data) => {
      await fetchChatHistoryHandler(socket, data)
    });

    socket.on('DISKONNECT', () => {
      console.log('Client disconnected:', socket.id);
    });
    } catch (error) {
      console.error(error)
    }
  });
};