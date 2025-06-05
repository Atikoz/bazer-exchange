import { Socket } from "socket.io";
import P2PLoansOrder from "../../../../models/p2p/modelP2PLoansOrder";

interface JoinOrderRoomPayload {
  socketId: string;
  telegramId: number;
}


const handleJoinOrder = async (socket: Socket, { socketId, telegramId }: JoinOrderRoomPayload): Promise<void> => {
  try {
    const order = await P2PLoansOrder.findOne({ socketId });

    if (!order) {
      console.log('order not found');
      socket.emit('ERROR', { message: 'Order not found' });
      return
    }

    if (telegramId !== order.buyerId && telegramId !== order.sellerId) {
      console.log('!err validation telegramId order');
      socket.emit('ERROR', { message: 'Access denied' });
      return
    }

    // Якщо валідація пройшла, підключаємо клієнта до кімнати
    socket.join(socketId);
    socket.emit('JOINED', { message: 'Successfully joined the order', order });
    console.log(`User ${telegramId} joined order ${socketId}`);
  } catch (error) {
    console.error(`Error joining order ${socketId}: `, error);
    socket.emit('ERROR', { message: `Error joining the order: ${error.message}` });
  }
}

export default handleJoinOrder