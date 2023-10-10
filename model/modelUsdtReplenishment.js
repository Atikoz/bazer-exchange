const mongoose = require('mongoose');

const UsdtReplenishment = mongoose.model('UsdtReplenishment', {
  id: String,
  coin: String,
  hash: String,
  amount: Number
});

module.exports = UsdtReplenishment;