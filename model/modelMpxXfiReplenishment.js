const mongoose = require('mongoose');

const MpxXfiReplenishment = mongoose.model('Mpx-Xfi-Replenishment', {
  id: String,
  coin: String,
  hash: String,
  amount: Number
});

module.exports = MpxXfiReplenishment;