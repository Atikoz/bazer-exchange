const ChatMessage = require("../../../../model/ws/ChatMessage");

const fetchChatHistoryHandler = async (socket, { socketId }) => {
  try {
    const messages = await ChatMessage.find({ socketId }).sort({ timestamp: 1 });

    // Відправляємо історію чату клієнту
    socket.emit('chatHistory', messages);
  } catch (error) {
    console.error(error);
    socket.emit('error', { message: `Error fetching chat history: ${error.message}` });
  }
};