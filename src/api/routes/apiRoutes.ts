import { Router } from 'express';
import userRoutes from './userRoutes';
import createOrderRoutes from './ordersRoutes';

const router = Router();

router.use('/user', userRoutes);
router.use('/orders', createOrderRoutes);

export default router;
