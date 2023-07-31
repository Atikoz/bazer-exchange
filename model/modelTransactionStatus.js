const mongoose = require('mongoose');

const TransactionStatus = mongoose.model('TransactionStatus', {
  id: String,
  hash: String,
  status: String,
  amount: Number,
  processed: Boolean,
})

module.exports = TransactionStatus;