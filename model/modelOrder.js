const mongoose = require('mongoose');

const CustomOrder = mongoose.model('CustomOrder', {
  id: String,
  orderNumber: Number,
  type: String,
  status: String,
  processed: Boolean,
  sellCoin: String,
  buyCoin: String,
  buyAmount: Number,
  sellAmount: Number,
  rate: Number
})

module.exports = CustomOrder;