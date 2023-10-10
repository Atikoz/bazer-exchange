const mongoose = require('mongoose');

const MinePlexReplenishment = mongoose.model('MinePlexReplenishment', {
  id: String,
  coin: String,
  hash: String,
  amount: Number
});

module.exports = MinePlexReplenishment;