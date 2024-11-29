const mongoose = require('mongoose');

const TransactionUsdtStatus = mongoose.model('TransactionUsdtStatus', {
  id: {
    type: String,
    required: true
  },
  coin: {
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
  amount: {
    type: Number,
    required: true
  },
  processed: {
    type: Boolean,
    required: true
  },
})

module.exports = TransactionUsdtStatus;