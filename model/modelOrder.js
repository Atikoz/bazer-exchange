const mongoose = require('mongoose');

const CustomOrder = mongoose.model('CustomOrder', {
  id: {
    type: String,
    required: true
  },
  orderNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  sellCoin: {
    type: String,
    required: true
  },
  buyCoin: {
    type: String,
    required: true
  },
  buyAmount: {
    type: Number,
    required: true
  },
  sellAmount: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  comission: {
    type: Number,
    required: true
  }
})

module.exports = CustomOrder;