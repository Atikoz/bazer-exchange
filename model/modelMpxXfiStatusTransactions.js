const mongoose = require('mongoose');

const TransactionMpxXfiStatus = mongoose.model('Transaction-Mpx-Xfi-Status', {
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

module.exports = TransactionMpxXfiStatus;