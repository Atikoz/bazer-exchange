const { model, Schema } = require('mongoose');

const poolUserSchema = new Schema({
  id: { type: Number, required: true },
  amountFirstCoin: { type: Number, required: true },
  amountSecondCoin: { type: Number, required: true },
})

const DoubleLiquidityPoolSchema = new Schema({
  firstCoin: { type: String, required: true },
  secondCoin: { type: String, required: true },
  poolUser: { type: [poolUserSchema], required: true }
});

const DoubleLiquidityPool = model('double-liquidity-pool', DoubleLiquidityPoolSchema)

module.exports = DoubleLiquidityPool;