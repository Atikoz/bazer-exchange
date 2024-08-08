const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const createOrderRoutes = require('./ordersRoutes');

router.use('/user', authRoutes);
router.use('/orders', createOrderRoutes);

module.exports = router;
