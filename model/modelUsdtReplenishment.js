const mongoose = require('mongoose');

const UsdtReplenishment = mongoose.model('UsdtReplenishment', {
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

module.exports = UsdtReplenishment;