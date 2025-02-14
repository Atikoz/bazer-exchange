const { Schema, model } = require('mongoose');

const poolUserSchema = new Schema({
  id: { type: Number, required: true },
  amountFirstCoin: { type: Number, required: true },
  amountSecondCoin: { type: Number, required: true },
})

const SingleLiquidityPoolSchema = new Schema({
  firstCoin: { type: String, required: true },
  secondCoin: { type: String, required: true },
  poolUser: { type: [poolUserSchema], required: true }
});

const SingleLiquidityPool = model('single-liquidity-pool', SingleLiquidityPoolSchema);

module.exports = SingleLiquidityPool;