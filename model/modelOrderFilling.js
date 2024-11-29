const mongoose = require('mongoose');

const OrderFilling = mongoose.model('OrderFilling', {
  orderNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  processed: {
    type: Boolean,
    required: true
  },
  creatorOrder: {
    type: Number,
    required: true
  },
  client: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
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
  coinAmount: {
    type: Number,
    required: true
  },
  currencyAmount: {
    type: Number,
    required: true
  },
  requisites: {
    type: Number,
    required: true
  }
});

module.exports = OrderFilling;