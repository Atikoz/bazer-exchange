const mongoose = require('mongoose');

const TransactionMinePlextStatus = mongoose.model('TransactionMinePlextStatus', {
  id: String,
  coin: String,
  hash: String,
  status: String,
  amount: Number,
  processed: Boolean,
})

module.exports = TransactionMinePlextStatus;