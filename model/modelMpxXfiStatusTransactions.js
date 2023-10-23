const mongoose = require('mongoose');

const TransactionMpxXfiStatus = mongoose.model('Transaction-Mpx-Xfi-Status', {
  id: String,
  coin: String,
  hash: String,
  status: String,
  amount: Number,
  processed: Boolean,
})

module.exports = TransactionMpxXfiStatus;