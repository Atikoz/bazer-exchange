const mongoose = require('mongoose');

const ExchangeStatus = mongoose.model('ExchangeStatus', {
  id: String,
  hash: String,
  status: String,
  processed: Boolean,
  coinSell: String,
  coinBuy: String
})

module.exports = ExchangeStatus;