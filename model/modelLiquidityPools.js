const mongoose = require('mongoose');

const LiquidityPools = mongoose.model('Liquidity-Pools', {
  id: String,
  token: String,
  sellCoin: String,
  buyCoin: String,
  amount: Number
});

module.exports = LiquidityPools;