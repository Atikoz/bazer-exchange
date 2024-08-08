const express = require('express');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { createOrder, getUserOrders, getAllOrders } = require('../controllers/ordersController');
const { createOrderSchema } = require('../schemas/createOrderSchemas');
const { getUserOrdersSchema } = require('../schemas/getUserOrdersSchemas');

const router = express.Router();

router.post('/createOrder', validateRequest(createOrderSchema), createOrder);
router.get('/get-user-orders', validateRequest(getUserOrdersSchema), getUserOrders);
router.get('/get-all-orders', getAllOrders);


module.exports = router;
