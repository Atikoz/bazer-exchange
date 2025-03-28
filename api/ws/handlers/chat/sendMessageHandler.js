const ChatMessage = require("../../../../model/ws/ChatMessage");

const sendMessageHandler = async (socket, io, { socketId, senderId, message }) => {
  try {
    if (!message.trim()) return; // Перевірка на пусте повідомлення

    const chat = await ChatMessage.findOneAndUpdate(
      { socketId },
      { $push: { messages: { senderId, message } } },
      { new: true, upsert: true }
    );


    // Відправляємо повідомлення всім у кімнаті
    io.to(socketId).emit('NEW_MESSAGE', chat.messages.at(-1));

    console.log(`Message sent to order ${socketId}:`, chat.messages.at(-1));
  } catch (error) {
    console.error(error);
    socket.emit('ERROR', { message: `Error sending message: ${error.message}` });
  }
};

module.exports = sendMessageHandler;