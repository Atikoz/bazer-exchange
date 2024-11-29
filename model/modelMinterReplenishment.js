const mongoose = require('mongoose');

const MinterReplenishment = mongoose.model('Minter-Replenishment', {
  id: {
    type: String,
    required: true
  },
  hash: {
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
});

module.exports = MinterReplenishment;