const P2PLoansOrder = require("../../../../model/p2pLoans/modelP2POrder");

const updateOrderHandler = async (socket, io, data) => {
  const { socketId, statusOrder } = data;

  try {
    await P2PLoansOrder.updateOne(
      { socketId: socketId },
      { $set: { statusOrder: statusOrder } }
    );

    const updatedOrder = await P2PLoansOrder.findOne({ socketId });

    if (!updatedOrder) {
      return socket.emit('error', { message: 'Order not found after update' });
    }

    io.to(socketId).emit('orderUpdated', updatedOrder);
    console.log(`Order ${socketId} updated to status: ${statusOrder}`);
  } catch (error) {
    console.error(error);
    socket.emit('error', { message: `Error update the order: ${error.message}` });
  }
}

module.exports = updateOrderHandler