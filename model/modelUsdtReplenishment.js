const { Schema, model } = require('mongoose');

const UsdtReplenishmentSchema = new Schema({
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
    required: true,
    uniq: true
  },
  amount: {
    type: Number,
    required: true
  }
})

const UsdtReplenishment = model('UsdtReplenishment', UsdtReplenishmentSchema);

module.exports = UsdtReplenishment;