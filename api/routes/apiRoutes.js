const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const createOrderRoutes = require('./ordersRoutes');

router.use('/user', userRoutes);
router.use('/orders', createOrderRoutes);

module.exports = router;
