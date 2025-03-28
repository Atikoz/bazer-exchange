const sendMessageHandler = require("./handlers/chat/sendMessageHandler");
const fetchChatHistoryHandler = require("./handlers/chat/fetchChatHistoryHandler");
const handleJoinOrder = require("./handlers/order/handleJoinOrder");
const updateOrderHandler = require("./handlers/order/updateOrderHandler");

module.exports = (io) => {
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