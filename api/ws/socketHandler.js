const sendMessageHandler = require("./handlers/chat/sendMessageHandler");
const fetchChatHistoryHandler = require("./handlers/chat/fetchChatHistoryHandler");
const handleJoinOrder = require("./handlers/order/handleJoinOrder");
const updateOrderHandler = require("./handlers/order/updateOrderHandler");

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    try {
    socket.on('joinOrder', async (data) => {
      handleJoinOrder(socket, data)
    });

    socket.on('updateOrder', async (data) => {
      updateOrderHandler(socket, io, data)
    });

    socket.on('sendMessage', async (data) => {
      sendMessageHandler(socket, io, data)
    });

    socket.on('fetchChatHistory', async (data) => {
      fetchChatHistoryHandler(socket, data)
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
    } catch (error) {
      console.error(error)
    }
  });
};