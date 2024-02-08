const mongoose = require('mongoose');

const CustomOrder = mongoose.model('CustomOrder', {
  id: String,
  orderNumber: Number,
  status: String,
  sellCoin: String,
  buyCoin: String,
  buyAmount: Number,
  sellAmount: Number,
  rate: Number,
  comission: Number
})

module.exports = CustomOrder;