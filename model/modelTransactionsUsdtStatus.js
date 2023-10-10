const mongoose = require('mongoose');

const TransactionUsdtStatus = mongoose.model('TransactionUsdtStatus', {
  id: String,
  coin: String,
  hash: String,
  status: String,
  amount: Number,
  processed: Boolean,
})

module.exports = TransactionUsdtStatus;