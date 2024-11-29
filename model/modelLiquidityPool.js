const mongoose = require('mongoose');

const poolUserSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  amountFirstCoin: { type: Number, required: true },
  amountSecondCoin: { type: Number, required: true },
})

const LiquidityPoolModel = mongoose.model('Liquidity-pool-model', {
  firstCoin: { type: String, required: true },
  secondCoin: { type: String, required: true },
  poolUser: { type: [poolUserSchema], required: true }
});
module.exports = LiquidityPoolModel;