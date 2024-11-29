const mongoose = require('mongoose');

const ArteryReplenishment = mongoose.model('Artery-Replenishment-Admin-Wallet', {
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
  amountCommission: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

module.exports = ArteryReplenishment;