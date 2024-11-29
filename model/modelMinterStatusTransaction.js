const mongoose = require('mongoose');

const TransactionMinterStatus = mongoose.model('Transaction-Minter-Status', {
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
  coin: {
    type: String,
    required: true
  }
})

module.exports = TransactionMinterStatus;