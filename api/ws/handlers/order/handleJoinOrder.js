const P2PLoansOrder = require("../../../../model/p2pLoans/modelP2POrder");

const handleJoinOrder = async (socket, { socketId, telegramId }) => {
  try {
    console.log(socketId);
    const order = await P2PLoansOrder.findOne({ socketId });

    if (!order) {
      console.log('!order');
      return socket.emit('ERROR', { message: 'Order not found' });
    }

    if (telegramId !== order.buyerId && telegramId !== order.sellerId) {
      console.log('!err validation telegramId order');
      return socket.emit('ERROR', { message: 'Access denied' });
    }

    // Якщо валідація пройшла, підключаємо клієнта до кімнати
    socket.join(socketId);
    socket.emit('JOINED', { message: 'Successfully joined the order', order });
    console.log(`User ${telegramId} joined order ${socketId}`);
  } catch (error) {
    socket.emit('ERROR', { message: `Error joining the order: ${error.message}` });
  }
}

module.exports = handleJoinOrder