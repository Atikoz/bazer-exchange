const mongoose = require('mongoose');

const MinterReplenishment = mongoose.model('Minter-Replenishment', {
  id: String,
  hash: String,
  amount: Number
});

module.exports = MinterReplenishment;