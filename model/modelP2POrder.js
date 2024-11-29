const mongoose = require('mongoose');

const CustomP2POrder = mongoose.model('CustomP2POrder', {
  id: {
    type: String,
    required: true
  },
  orderNumber: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  coin: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  minAmount: {
    type: Number,
    required: true
  },
  paymentSystem: {
    type: String,
    required: true
  },
  requisites: {
    type: Number,
    required: true
  }
})

module.exports = CustomP2POrder;