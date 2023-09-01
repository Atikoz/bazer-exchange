const mongoose = require('mongoose');

const CustomP2POrder = mongoose.model('CustomP2POrder', {
  id: String,
  orderNumber: Number,
  type: String,
  status: String,
  processed: Boolean,
  coin: String,
  currency: String,
  amount: Number,
  rate: Number,
  minAmount: Number,
  paymentSystem: String,
  requisites: Number
})

module.exports = CustomP2POrder;