const ChatMessage = require("../../../../model/ws/ChatMessage");

const sendMessageHandler = async (socket, io, { socketId, senderId, message }) => {
  try {
    if (!message.trim()) return; // Перевірка на пусте повідомлення

    // Створюємо нове повідомлення в базі
    const newMessage = new ChatMessage({ socketId, senderId, message });
    await newMessage.save();

    // Відправляємо повідомлення всім у кімнаті
    io.to(socketId).emit('newMessage', newMessage);

    console.log(`Message sent to order ${socketId}:`, message);
  } catch (error) {
    console.error(error);
    socket.emit('error', { message: `Error sending message: ${error.message}` });
  }
};

module.exports = sendMessageHandler;