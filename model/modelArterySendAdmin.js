const mongoose = require('mongoose');

const ArteryReplenishment = mongoose.model('Artery-Replenishment-Admin-Wallet', {
  id: String,
  hash: String,
  amount: Number,
  amountCommission: Number,
  status: String
});

module.exports = ArteryReplenishment;