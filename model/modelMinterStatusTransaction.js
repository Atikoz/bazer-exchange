const mongoose = require('mongoose');

const TransactionMinterStatus = mongoose.model('Transaction-Minter-Status', {
  id: String,
  hash: String,
  status: String,
  amount: Number,
})

module.exports = TransactionMinterStatus;