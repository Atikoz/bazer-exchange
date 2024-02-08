const mongoose = require('mongoose');

const LiquidityPools = mongoose.model('Liquidity-Pools', {
  id: String,
  token: String,
  sellCoin: String,
  buyCoin: String,
  amount: Number,
  comission: Number
});

module.exports = LiquidityPools;