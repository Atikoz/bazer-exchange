const mongoose = require('mongoose');

const TransactionStatus = mongoose.model('TransactionStatus', {
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
  amount: {
    type: Number,
    required: true
  },
  processed: {
    type: Boolean,
    required: true
  },
})

module.exports = TransactionStatus;