const mongoose = require('mongoose');

const LiquidityPoolModel = mongoose.model('Liquidity-pool-model', {
  firstCoin: String,
  secondCoin: String,
  poolUser: [] /* {
    id: Number,
    amountFirstCoin: Number,
    amountSecondCoin: Number,
  } */
});
module.exports = LiquidityPoolModel;