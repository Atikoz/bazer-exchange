import { Router } from "express";
import validateRequest from "../middlewares/validationMiddleware";
import createOrderSchema from "../schemas/createOrderSchemas";
import OrdersController from "../controllers/ordersController";


const router = Router();

router.post('/createOrder', validateRequest(createOrderSchema), OrdersController.createOrder);
router.get('/get-user-orders/', OrdersController.getUserOrders);
router.get('/get-all-orders', OrdersController.getAllOrders);


export default router;
