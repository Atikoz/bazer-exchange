const mongoose = require('mongoose');

const MpxXfiReplenishment = mongoose.model('Mpx-Xfi-Replenishment', {
  id: {
    type: String,
    required: true
  },
  coin: {
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
  }
});

module.exports = MpxXfiReplenishment;