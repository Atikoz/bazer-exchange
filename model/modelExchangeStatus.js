const mongoose = require('mongoose');

const ExchangeStatus = mongoose.model('ExchangeStatus', {
  id: {
    type: String,
    required: true
  },
  hash: {
    type: String,
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
  coinSell: {
    type: String,
    required: true
  },
  coinBuy: {
    type: String,
    required: true
  }
})

module.exports = ExchangeStatus;