const mongoose = require('mongoose');

const OrderFilling = mongoose.model('OrderFilling', {
  orderNumber: Number,
  status: String,
  processed: Boolean,
  creatorOrder: Number,
  client: Number,
  rate: Number,
  coin: String,
  currency: String,
  coinAmount: Number,
  currencyAmount: Number,
  requisites: Number
});

module.exports = OrderFilling;