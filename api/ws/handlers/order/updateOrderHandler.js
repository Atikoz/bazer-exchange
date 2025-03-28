const P2PLoansOrder = require("../../../../model/p2pLoans/modelP2POrder");
const ChatMessage = require("../../../../model/ws/ChatMessage");

const updateOrderHandler = async (socket, io, data) => {
  const { socketId, statusOrder } = data;

  try {
    await P2PLoansOrder.updateOne(
      { socketId: socketId },
      { $set: { statusOrder: statusOrder } }
    );

    const updatedOrder = await P2PLoansOrder.findOne({ socketId });

    if (!updatedOrder) {
      return socket.emit('ERROR', { message: 'Order not found after update' });
    }

    io.to(socketId).emit('ORDER_UPDATED', updatedOrder);
    console.log(`Order ${socketId} updated to status: ${statusOrder}`);

    if (statusOrder === 'Done') {
      const systemMessage = {
        senderId: 'Logs',
        message: `Ордер ${updatedOrder.name}(${updatedOrder.type}) выполнено.`,
        timestamp: new Date().toISOString()
      };

      await ChatMessage.findOneAndUpdate(
        { socketId },
        { $push: { messages: systemMessage } }, // Додаємо нове повідомлення
        { new: true, upsert: true } // Якщо чату немає — створюємо
      );

      io.to(socketId).emit('NEW_MESSAGE', systemMessage);
      console.log(`System message added to chat: ${systemMessage.message}`);
    }
  } catch (error) {
    console.error(error);
    socket.emit('ERROR', { message: `Error update the order: ${error.message}` });
  }
}

module.exports = updateOrderHandler