import { Schema, model } from "mongoose";

interface PoolUser {
  id: number;
  amountFirstCoin: number;
  amountSecondCoin: number;
}

export interface DoubleLiquidityPoolDocument extends Document {
  firstCoin: string;
  secondCoin: string;
  poolUser: PoolUser[];
}

const poolUserSchema = new Schema<PoolUser>({
  id: { type: Number, required: true },
  amountFirstCoin: { type: Number, required: true },
  amountSecondCoin: { type: Number, required: true },
})

const DoubleLiquidityPoolSchema = new Schema<DoubleLiquidityPoolDocument>({
  firstCoin: { type: String, required: true },
  secondCoin: { type: String, required: true },
  poolUser: { type: [poolUserSchema], required: true }
});

const DoubleLiquidityPool = model('double-liquidity-pool', DoubleLiquidityPoolSchema)

export default DoubleLiquidityPool;