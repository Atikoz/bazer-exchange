import { v4 as uuidv4 } from 'uuid';
import P2PLoansOrder from '../../models/p2p/modelP2PLoansOrder';
import { Request, Response } from 'express';


interface CreateOrderRequestBody {
  buyerId: number;
  sellerId: number;
  type: string;
  name: string;
  currency: string;
  price: number;
  photo: string;
  description: string;
  requisites: string;
  collateral: number;
  downPayment: number;
}

interface GetUserOrdersQuery {
  userId: number;
}

class OrdersController {
  async createOrder(req: Request<{}, {}, CreateOrderRequestBody>, res: Response): Promise<void> {
    try {
      const {
        buyerId,
        sellerId,
        type,
        name,
        currency,
        price,
        photo,
        description,
        requisites,
        collateral,
        downPayment
      } = req.body;

      const socketId = uuidv4();

      const result = await P2PLoansOrder.create({
        buyerId: buyerId,
        sellerId: sellerId,
        statusOrder: 'WaitPayment',
        type: type,
        name: name,
        currency: currency,
        price: price,
        photo: photo,
        description: description,
        requisites: requisites,
        collateral: collateral,
        downPayment: downPayment,
        socketId: socketId
      });

      if (!result) {
        throw new Error('error create order');
      }

      res.status(200).json({
        status: 'ok',
        error: '',
        message: 'order created',
        socketUrl: `https://p2p.bazerwallet.com/socket/${socketId}`
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'error create order',
        message: error.message,
      });
    }
  };

  async getUserOrders(req: Request<{}, {}, {}, GetUserOrdersQuery>, res: Response): Promise<void> {
    try {
      const { userId } = req.query;

      const result = await P2PLoansOrder.find({
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      });

      res.status(200).json({
        status: 'ok',
        error: '',
        data: {
          orders: result
        },
        message: result.length ? 'orders find' : 'no orders found',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'error search order',
        data: {},
        message: error.message,
      });
    }
  };

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const result = await P2PLoansOrder.find();
  
      res.status(200).json({
        status: 'ok',
        error: '',
        data: {
          orders: result
        },
        message: 'orders find',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'error search order',
        data: {},
        message: error.message,
      });
    }
  }
}

export default new OrdersController();