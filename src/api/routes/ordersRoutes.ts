import { Router } from "express";
import validateRequest from "../middlewares/validationMiddleware";
import createOrderSchema from "../schemas/createOrderSchemas";
import OrdersController from "../controllers/ordersController";
import mockAuthMiddleware from "../middlewares/authMiddleware";


const router = Router();

router.post('/createOrder', mockAuthMiddleware, validateRequest(createOrderSchema), OrdersController.createOrder);
router.get('/get-user-orders/', mockAuthMiddleware, OrdersController.getUserOrders);
router.get('/get-all-orders', mockAuthMiddleware, OrdersController.getAllOrders);


export default router;
