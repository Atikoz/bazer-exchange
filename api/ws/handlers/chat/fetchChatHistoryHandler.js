const ChatMessage = require("../../../../model/ws/ChatMessage");

const fetchChatHistoryHandler = async (socket, { socketId }) => {
  try {
    const chat = await ChatMessage.findOne({ socketId });

    // Відправити історію чату клієнту
    socket.emit("CHAT_HISTORY", chat?.messages || []);
  } catch (error) {
    console.error(error);
    socket.emit('ERROR', { message: `Error fetching chat history: ${error.message}` });
  }
};

module.exports = fetchChatHistoryHandler