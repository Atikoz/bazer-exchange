const P2PLoansOrder = require("../model/p2pLoans/modelP2POrder");

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    try {
    socket.on('joinOrder', async ({ socketId, telegramId }) => {
      try {
        console.log(socketId);
        const order = await P2PLoansOrder.findOne({ socketId });

        if (!order) {
          console.log('!order');
          return socket.emit('error', { message: 'Order not found' });
        }

        if (telegramId !== order.buyerId && telegramId !== order.sellerId) {
          console.log('!err validation telegramId order');
          return socket.emit('error', { message: 'Access denied' });
        }

        // Якщо валідація пройшла, підключаємо клієнта до кімнати
        socket.join(socketId);
        socket.emit('joined', { message: 'Successfully joined the order', order });
        console.log(`User ${telegramId} joined order ${socketId}`);

      } catch (error) {
        socket.emit('error', { message: `Error joining the order: ${error.message}` });
      }
    });

    socket.on('updateOrder', async (data) => {
      const { socketId, statusOrder } = data;

      try {
        await P2PLoansOrder.updateOne(
          { socketId: socketId },
          { $set: { statusOrder: statusOrder } }
        )
        io.to(socketId).emit('orderUpdated', { statusOrder });
        console.log(`Order ${socketId} updated to status: ${statusOrder}`);
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: `Error update the order: ${error.message}` });
      }
      
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
    } catch (error) {
      console.error(error)
    }
  });
};