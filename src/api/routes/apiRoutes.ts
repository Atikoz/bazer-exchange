import { Router } from 'express';
import userRoutes from './userRoutes';
import createOrderRoutes from './ordersRoutes';
import messageRoutes from './messageRoutes';

const router = Router();

router.use('/user', userRoutes);
router.use('/orders', createOrderRoutes);
router.use('/messages', messageRoutes);

export default router;
